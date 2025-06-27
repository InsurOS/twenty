import { Injectable } from '@nestjs/common';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import axios from 'axios';
import { createHash } from 'crypto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { RabbitSignKeyService } from 'src/modules/rabbitsign/rabbitsignkey.service';
import { Extract, Open } from 'unzipper';
import { v4 as uuidv4 } from 'uuid';
import { RabbitSignSignerService } from './rabbitsignsigner.service';
import { RabbitSignSignatureWorkspaceEntity } from './standard-objects/rabbitsignsignature.workplace-entity';

interface RabbitSignSignatureRequest {
  title: string;
  message: string;
  pdfBuffer: Buffer;
  signers: Array<{
    email: string;
    name: string;
    signaturePosition: {
      x: number;
      y: number;
      width: number;
      height: number;
      pageIndex: number;
    };
  }>;
}

@Injectable()
export class RabbitSignSignatureService extends TypeOrmQueryService<RabbitSignSignatureWorkspaceEntity> {
  private readonly RABBITSIGN_API_BASE_URL = 'https://www.rabbitsign.com/api/v1';

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly rabbitSignKeyService: RabbitSignKeyService,
    private readonly rabbitSignSignerService: RabbitSignSignerService,
    private readonly fileUploadService: FileUploadService,
  ) {
    super(null as any);
  }

  private getCurrentUtcTime(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
  }

  private getTodayInLocalTimezone(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  private sha512(input: string): string {
    return createHash('sha512').update(input, 'utf8').digest('hex').toUpperCase();
  }

  private createSignatureHeaders(
    httpMethod: string,
    path: string,
    apiKeyId: string,
    apiKeySecret: string,
  ) {
    const utcTime = this.getCurrentUtcTime();
    const signature = this.sha512(`${httpMethod} ${path} ${utcTime} ${apiKeySecret}`);

    return {
      'x-rabbitsign-api-key-id': apiKeyId,
      'x-rabbitsign-api-signature': signature,
      'x-rabbitsign-api-time-utc': utcTime,
    };
  }

  async createSignature(
    workspaceId: string,
    workspaceMemberId: string,
    signatureRequest: RabbitSignSignatureRequest,
  ) {
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        workspaceId,
        'rabbitSignSignature',
      );

    // Step 1: Create the signature record with initial status
    const signatureRecord = await rabbitSignSignatureRepository.save({
      title: signatureRequest.title,
      signatureStatus: 'PROCESSING',
      workspaceMemberId,
    });

    try {
      // Step 2: Call RabbitSign API
      const result = await this.createRabbitSignSignatureExternally(
        signatureRecord.id,
        workspaceMemberId,
        workspaceId,
        signatureRequest,
      );

      // Step 3: Update the record with success status and external data
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { 
          signatureStatus: 'SENT_FOR_SIGNATURE',
          // You might want to store additional info like folder ID
        }
      );

      return {
        ...signatureRecord,
        signatureStatus: 'SENT_FOR_SIGNATURE',
        externalData: result,
      };

    } catch (error) {
      // Step 4: Update the record with failure status
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { signatureStatus: 'FAILED' }
      );

      console.error('RabbitSign API Error:', error);
      
      throw new Error(
        `Failed to create RabbitSign signature: ${error?.response?.data?.message || error?.message || 'Unknown error'}`
      );
    }
  }

  private async createRabbitSignSignatureExternally(
    rabbitSignSignatureId: string,
    workspaceMemberId: string,
    workspaceId: string,
    signatureRequest: RabbitSignSignatureRequest,
  ) {
    // Get the rabbitSignKey for the workspace member
    const rabbitSignKey = await this.rabbitSignKeyService.getRabbitSignKeyForWorkspace(workspaceMemberId, workspaceId);

    const { keyId, keySecret } = rabbitSignKey;
    const { title, message, pdfBuffer, signers } = signatureRequest;

    // Step 1: Get upload URL
    const path1 = '/api/v1/upload-url';
    const headers1 = this.createSignatureHeaders('POST', path1, keyId, keySecret);
    
    const uploadUrlResp = await axios.post(
      `${this.RABBITSIGN_API_BASE_URL}/upload-url`,
      null,
      { headers: headers1 }
    );
    
    const uploadUrl = uploadUrlResp.data.uploadUrl;

    // Step 2: Upload PDF
    await axios.put(uploadUrl, pdfBuffer, {
      headers: { 'Content-Type': 'binary/octet-stream' }
    });

    // Step 3: Create folder (signing request)
    const path2 = '/api/v1/folder';
    const headers2 = {
      ...this.createSignatureHeaders('POST', path2, keyId, keySecret),
      'Content-Type': 'application/json',
    };

    // Build signer info object
    const signerInfo: Record<string, any> = {};
    signers.forEach((signer, index) => {
      signerInfo[signer.email] = {
        name: signer.name,
        fields: [
          {
            id: index + 1,
            type: 'SIGNATURE',
            currentValue: '',
            position: {
              docNumber: 0,
              pageIndex: signer.signaturePosition.pageIndex,
              x: signer.signaturePosition.x,
              y: signer.signaturePosition.y,
              width: signer.signaturePosition.width,
              height: signer.signaturePosition.height,
            },
          },
        ],
      };
    });

    const body2 = {
      folder: {
        title: title,
        summary: message,
        docInfo: [
          {
            url: uploadUrl,
            docTitle: title,
          },
        ],
        signerInfo,
      },
      date: this.getTodayInLocalTimezone(),
    };

    const folderResp = await axios.post(
      `${this.RABBITSIGN_API_BASE_URL}/folder`,
      body2,
      { headers: headers2 }
    );

    return {
      success: true,
      folderId: folderResp.data.folderId,
      uploadUrl,
      response: folderResp.data,
    };
  }

  async createSignatureWithExternalCall(input: {
    title: string;
    message: string;
    workspaceMemberId: string;
    workspaceId: string;
    attachmentId: string;
    pdfBuffer?: Buffer;
    signers?: Array<{
      email: string;
      name: string;
      signeeId: string;
      signaturePosition: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
      };
    }>;
  }) {
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        input.workspaceId,
        'rabbitSignSignature',
      );

    // Step 1: Create the record
    const signatureRecord = await rabbitSignSignatureRepository.save({
      title: input.title,
      signatureStatus: 'PROCESSING',
      workspaceMemberId: input.workspaceMemberId,
      attachmentId: input.attachmentId,
    });

    const attachmentRepository = await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
      input.workspaceId,
      'attachment',
    );

    await attachmentRepository.save({
      id: input.attachmentId,
      signatureId: signatureRecord.id,
    });

    try {
      // Step 2: Call external API if we have the required data
      let result;
      if (input.pdfBuffer && input.signers) {
        result = await this.createRabbitSignSignatureExternally(
          signatureRecord.id,
          input.workspaceMemberId,
          input.workspaceId,
          {
            title: input.title,
            message: input.message,
            pdfBuffer: input.pdfBuffer,
            signers: input.signers,
          },
        );

        // Step 3: Create signer records
        if (input.signers) {
          const signersData = input.signers.map((signer, index) => ({
            personId: signer.signeeId,
            status: 'NOTIFIED', // Initial status when signature is sent
            signingOrder: index + 1,
          }));

          await this.rabbitSignSignerService.createSigners(
            input.workspaceId,
            signatureRecord.id,
            signersData,
          );
        }
      }

      // Step 4: Update status
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { 
          signatureStatus: 'SENT_FOR_SIGNATURE',
          folderId: result?.folderId,
        },
      );

      return signatureRecord;
    } catch (error) {
      // Step 5: Update status on failure
      await rabbitSignSignatureRepository.update(
        { id: signatureRecord.id },
        { signatureStatus: 'FAILED' }
      );
      throw error;
    }
  }

  async findSignatureByFolderId(workspaceId: string, folderId: string): Promise<string | null> {
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        workspaceId,
        'rabbitSignSignature',
      );

    const signature = await rabbitSignSignatureRepository.findOne({
      where: { folderId },
    });

    return signature?.id || null;
  }

  async handleWebhookEvent(
    workspaceId: string,
    signatureId: string,
    eventName: string,
    signerEmail: string,
  ) {
    console.log(`Handling webhook event: ${eventName} for signer: ${signerEmail}`);

    // Update the specific signer's status based on the event
    await this.rabbitSignSignerService.updateSignerStatusByEmail(
      workspaceId,
      signatureId,
      signerEmail,
      eventName === 'SIGNER_SIGNED' ? 'SIGNED' : 'PENDING',
    );

    // Check if all signers have signed
    const allSignersSigned = await this.rabbitSignSignerService.areAllSignersSigned(
      workspaceId,
      signatureId,
    );

    // If all signers have signed, update the signature status to completed
    if (allSignersSigned) {
      const rabbitSignSignatureRepository = 
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
          workspaceId,
          'rabbitSignSignature',
        );

      await rabbitSignSignatureRepository.update(
        { id: signatureId },
        { signatureStatus: 'COMPLETED' },
      );


      // In your webhook handler
      await this.processSignatureDocuments(
        workspaceId,
        signatureId
      );

      console.log(`Signature ${signatureId} marked as completed - all signers have signed`);
    }
  }

  /**
   * Process signature documents by downloading the zip from RabbitSign,
   * extracting the documents, uploading them to S3, and creating attachment records
   */
  async processSignatureDocuments(
    workspaceId: string,
    signatureId: string,
  ): Promise<Array<{ id: string; name: string; fullPath: string; type: string }>> {
    console.log(`Processing signature documents for signature ${signatureId} in workspace ${workspaceId}`);
    
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        workspaceId,
        'rabbitSignSignature',
      );

    const signature = await rabbitSignSignatureRepository.findOne({
      where: { id: signatureId },
    });

    if (!signature || !signature.folderId) {
      throw new Error('Signature not found or no folder ID available');
    }

    // Get the original attachment to copy its fields
    const attachmentRepository = await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
      workspaceId,
      'attachment',
    );

    const originalAttachment = await attachmentRepository.findOne({
      where: { signatureId: signatureId },
    });

    if (!originalAttachment) {
      throw new Error('Original attachment not found for signature');
    }

    console.log(`Found original attachment: ${originalAttachment.name} with personId: ${originalAttachment.personId}, companyId: ${originalAttachment.companyId}`);

    try {
      // Step 1: Get download URL from RabbitSign
      const rabbitSignKey = await this.rabbitSignKeyService.getRabbitSignKeyForWorkspace(signature.workspaceMemberId, workspaceId);
      const { keyId, keySecret } = rabbitSignKey;

      const path = `/api/v1/folder/${signature.folderId}`;
      const headers = this.createSignatureHeaders('GET', path, keyId, keySecret);

      const response = await axios.get(
        `${this.RABBITSIGN_API_BASE_URL}/folder/${signature.folderId}`,
        { headers }
      );

      const downloadUrl = response.data.downloadUrl;
      if (!downloadUrl) {
        throw new Error('No download URL available from RabbitSign');
      }

      // Step 2: Download the zip file
      console.log(`Downloading zip from RabbitSign: ${downloadUrl}`);
      const zipResponse = await axios.get(downloadUrl, {
        responseType: 'arraybuffer',
      });

      const zipBuffer = Buffer.from(zipResponse.data);
      console.log(`Downloaded zip file size: ${zipBuffer.length} bytes`);
      
      // Validate that we have a valid zip file
      if (zipBuffer.length < 4 || zipBuffer.toString('hex', 0, 4) !== '504b0304') {
        throw new Error('Downloaded file does not appear to be a valid ZIP file');
      }
      
      // Log the first few bytes for debugging
      console.log(`Zip file header: ${zipBuffer.toString('hex', 0, 16)}`);

      // Step 3: Extract documents from zip
      const extractedFiles: Array<{ name: string; buffer: Buffer; type: string }> = [];
      
      try {
        console.log('Starting zip extraction using buffer method...');
        
        // Use the Open.buffer method instead of streaming
        const directory = await Open.buffer(zipBuffer);
        
        console.log('Directory entries:', directory.files.length);
        
        for (const entry of directory.files) {
          console.log('Processing entry:', entry.path, entry.type);
          
          // Skip directories and hidden files
          if (entry.type === 'Directory' || entry.path.startsWith('.') || entry.path.endsWith('/')) {
            console.log(`Skipping directory or hidden file: ${entry.path}`);
            continue;
          }
          
          try {
            const buffer = await entry.buffer();
            const fileType = this.getFileTypeFromName(entry.path);
            console.log(`Extracted file: ${entry.path} (${buffer.length} bytes)`);
            
            extractedFiles.push({
              name: entry.path,
              buffer: buffer,
              type: fileType,
            });
          } catch (entryError) {
            console.error(`Error extracting file ${entry.path}:`, entryError);
            // Continue with other files
          }
        }
        
        console.log(`Zip extraction completed. Found ${extractedFiles.length} files.`);
        
      } catch (extractionError) {
        console.error('Failed to extract zip using buffer method:', extractionError);
        
        // Fallback: Try the original streaming approach as a last resort
        console.log('Trying streaming approach as fallback...');
        
        await new Promise<void>((resolve, reject) => {
          const stream = require('stream');
          const bufferStream = new stream.PassThrough();
          
          // Set up error handling for the buffer stream
          bufferStream.on('error', (error: any) => {
            console.error('Buffer stream error:', error);
            reject(error);
          });
          
          bufferStream.end(zipBuffer);

          const extractStream = Extract();
          
          // Set a timeout for the extraction process
          const timeout = setTimeout(() => {
            console.error('Zip extraction timed out after 30 seconds');
            reject(new Error('Zip extraction timed out'));
          }, 30000);
          
          extractStream.on('entry', (entry: any) => {
            console.log('Processing entry:', {
              path: entry.path,
              type: entry.type,
              size: entry.vars?.uncompressedSize
            });
            
            // Check if entry has a valid path
            if (!entry.path) {
              console.warn('Entry has no path, skipping');
              entry.autodrain();
              return;
            }
            
            const fileName = entry.path;
            const fileType = this.getFileTypeFromName(fileName);
            
            // Skip directories and hidden files
            if (entry.type === 'Directory' || fileName.startsWith('.')) {
              console.log(`Skipping directory or hidden file: ${fileName}`);
              entry.autodrain();
              return;
            }

            const chunks: Buffer[] = [];
            entry.on('data', (chunk: Buffer) => chunks.push(chunk));
            entry.on('end', () => {
              const fileBuffer = Buffer.concat(chunks);
              console.log(`Extracted file: ${fileName} (${fileBuffer.length} bytes)`);
              extractedFiles.push({
                name: fileName,
                buffer: fileBuffer,
                type: fileType,
              });
            });
            entry.on('error', (error: any) => {
              console.error(`Error processing entry ${fileName}:`, error);
              clearTimeout(timeout);
              reject(error);
            });
          })
          .on('end', () => {
            clearTimeout(timeout);
            console.log(`Zip extraction completed. Found ${extractedFiles.length} files.`);
            resolve();
          })
          .on('error', (error: any) => {
            clearTimeout(timeout);
            console.error('Error during zip extraction:', error);
            reject(error);
          });

          bufferStream.pipe(extractStream);
        });
      }

      if (extractedFiles.length === 0) {
        throw new Error('No files found in the zip archive');
      }

      // Step 4: Upload each document to S3 and create attachment records
      const uploadedAttachments: Array<{ id: string; name: string; fullPath: string; type: string }> = [];
      let auditTrailAttachment: any = null;
      let signedAttachment: any = null;

      for (const file of extractedFiles) {
        try {
          // Generate a unique filename to avoid conflicts
          const uniqueFilename = `${uuidv4()}_${file.name}`;
          
          // Upload to S3
          const uploadResult = await this.fileUploadService.uploadFile({
            file: file.buffer,
            filename: uniqueFilename,
            mimeType: this.getMimeType(file.type),
            fileFolder: FileFolder.Attachment,
            workspaceId,
          });

          // Determine if this is the audit trail or signed document based on filename
          const isAuditTrail = file.name.startsWith('Audit Trail_');
          const isSignedDocument = !isAuditTrail; // The other file is the signed document

          // Create attachment record
          const attachment = await attachmentRepository.save({
            name: file.name,
            fullPath: uploadResult.files[0].path,
            type: originalAttachment.type,
            authorId: signature.workspaceMemberId,
            // Copy the fields from the original attachment to link to the same person/company
            personId: originalAttachment.personId,
            companyId: originalAttachment.companyId,
            policyId: originalAttachment.policyId,
            taskId: originalAttachment.taskId,
            noteId: originalAttachment.noteId,
            opportunityId: originalAttachment.opportunityId,
          });

          // Store the appropriate attachment based on type
          if (isAuditTrail) {
            auditTrailAttachment = attachment;
            // Link audit trail attachment to signature
            await attachmentRepository.update(
              { id: attachment.id },
              { signatureAuditTrailDownloadId: signatureId }
            );
          } else if (isSignedDocument) {
            signedAttachment = attachment;
            // Link signed attachment to signature
            await attachmentRepository.update(
              { id: attachment.id },
              { signatureSignedId: signatureId }
            );
          }

          uploadedAttachments.push({
            id: attachment.id,
            name: file.name,
            fullPath: uploadResult.files[0].path,
            type: file.type,
          });

          console.log(`Successfully uploaded and created attachment for: ${file.name} (${isAuditTrail ? 'audit trail' : isSignedDocument ? 'signed document' : 'other'})`);
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error);
          // Continue with other files even if one fails
        }
      }

      // Update the signature record with the specific attachment references
      if (auditTrailAttachment || signedAttachment) {
        const updateData: any = {};
        if (auditTrailAttachment) {
          updateData.signatureAuditTrailDownloadAttachmentId = auditTrailAttachment.id;
        }
        if (signedAttachment) {
          updateData.signatureSignedAttachmentId = signedAttachment.id;
        }

        await rabbitSignSignatureRepository.update(
          { id: signatureId },
          updateData
        );

        console.log(`Updated signature ${signatureId} with audit trail: ${auditTrailAttachment?.id}, signed: ${signedAttachment?.id}`);
      }

      if (uploadedAttachments.length === 0) {
        throw new Error('Failed to upload any documents from the signature');
      }

      console.log(`Successfully processed ${uploadedAttachments.length} documents for signature ${signatureId}`);
      return uploadedAttachments;

    } catch (error) {
      console.error('Failed to process signature documents:', error);
      throw new Error(
        `Failed to process signature documents: ${error?.response?.data?.message || error?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get file type from filename
   */
  private getFileTypeFromName(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Get MIME type from file type
   */
  private getMimeType(fileType: string): string {
    // If fileType is already a MIME type, return it
    if (fileType.includes('/')) {
      return fileType;
    }
    
    // Otherwise, convert file extension to MIME type
    return this.getFileTypeFromName(`file.${fileType}`);
  }

  /**
   * Get download URL for a completed signature (deprecated - use processSignatureDocuments instead)
   */
  async getDownloadUrl(
    workspaceId: string,
    workspaceMemberId: string,
    signatureId: string,
  ): Promise<string | null> {
    console.log(`Getting repository for workspace ${workspaceId} to fetch signature ${signatureId}`);
    const rabbitSignSignatureRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignatureWorkspaceEntity>(
        workspaceId,
        'rabbitSignSignature',
      );

    const signature = await rabbitSignSignatureRepository.findOne({
      where: { id: signatureId, workspaceMemberId },
    });

    if (!signature || !signature.folderId) {
      return null;
    }

    try {
      const rabbitSignKey = await this.rabbitSignKeyService.getRabbitSignKeyForWorkspace(workspaceMemberId, workspaceId);
      const { keyId, keySecret } = rabbitSignKey;

      const path = `/api/v1/folder/${signature.folderId}`;
      const headers = this.createSignatureHeaders('GET', path, keyId, keySecret);

      const response = await axios.get(
        `${this.RABBITSIGN_API_BASE_URL}/folder/${signature.folderId}`,
        { headers }
      );

      return response.data.downloadUrl || null;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      return null;
    }
  }
}