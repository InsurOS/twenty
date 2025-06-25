import { Injectable } from '@nestjs/common';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { RabbitSignSignerWorkspaceEntity } from './standard-objects/rabbitsignsigner.workplace-entity';

interface SignerData {
  personId: string;
  status: string;
  signingOrder: number;
}

@Injectable()
export class RabbitSignSignerService extends TypeOrmQueryService<RabbitSignSignerWorkspaceEntity> {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(null as any);
  }

  async createSigners(
    workspaceId: string,
    signatureId: string,
    signersData: SignerData[],
  ): Promise<RabbitSignSignerWorkspaceEntity[]> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    const signers = signersData.map(signerData => ({
      ...signerData,
      signatureId,
    }));

    return await rabbitSignSignerRepository.save(signers);
  }

  async updateSignerStatus(
    workspaceId: string,
    signerId: string,
    status: string,
  ): Promise<RabbitSignSignerWorkspaceEntity | null> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    await rabbitSignSignerRepository.update(
      { id: signerId },
      { status }
    );

    return await rabbitSignSignerRepository.findOne({
      where: { id: signerId },
    });
  }

  async getSignersBySignatureId(
    workspaceId: string,
    signatureId: string,
  ): Promise<RabbitSignSignerWorkspaceEntity[]> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    return await rabbitSignSignerRepository.find({
      where: { signatureId },
      order: { signingOrder: 'ASC' },
      relations: ['person'],
    });
  }

  async updateSignersFromRabbitSignData(
    workspaceId: string,
    signatureId: string,
    rabbitSignData: {
      signers: Array<{
        email: string;
        name: string;
        status: string;
        signingOrder: number;
      }>;
    },
  ): Promise<void> {
    const rabbitSignSignerRepository = 
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<RabbitSignSignerWorkspaceEntity>(
        workspaceId,
        'rabbitSignSigner',
      );

    // Get existing signers to preserve personId relationships
    const existingSigners = await rabbitSignSignerRepository.find({
      where: { signatureId },
    });

    // Create a map of email to personId for existing signers
    const emailToPersonIdMap = new Map<string, string>();
    
    // We need to get person data to match by email
    // This is a simplified approach - in a real implementation you might want to
    // store the email in the signer entity or handle this differently
    for (const existingSigner of existingSigners) {
      // For now, we'll just update the status of existing signers
      // In a real implementation, you'd want to match by email and person
    }

    // Update existing signers with new status
    for (const rabbitSigner of rabbitSignData.signers) {
      const existingSigner = existingSigners.find(
        signer => signer.signingOrder === rabbitSigner.signingOrder
      );
      
      if (existingSigner) {
        await rabbitSignSignerRepository.update(
          { id: existingSigner.id },
          { status: rabbitSigner.status }
        );
      }
    }
  }
} 