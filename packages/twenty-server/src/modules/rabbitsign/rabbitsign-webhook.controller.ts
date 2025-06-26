import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { RabbitSignWebhookPayloadDto } from './dtos/rabbit-sign-webhook-payload.dto';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Controller('webhooks/rabbitsign')
@UseFilters()
export class RabbitSignWebhookController {
  constructor(
    private readonly rabbitSignSignatureService: RabbitSignSignatureService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  @Post('update-signature')
  @UseGuards(PublicEndpointGuard)
  async updateSignatureFromWebhook(
    @Body() payload: RabbitSignWebhookPayloadDto,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    try {
      // Extract workspace from the request origin
      const origin = request.get('origin') || request.get('host') || '';
      const workspace = await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(origin);
      
      if (!workspace) {
        throw new BadRequestException('Could not determine workspace from request origin');
      }

      const workspaceId = workspace.id;

      // Try to find signature by folderId
      const foundSignatureId = await this.rabbitSignSignatureService.findSignatureByFolderId(
        workspaceId,
        payload.folderId,
      );
      
      if (!foundSignatureId) {
        throw new BadRequestException(`No signature found for folderId: ${payload.folderId}`);
      }
      
      // Handle the webhook based on event type
      await this.rabbitSignSignatureService.handleWebhookEvent(
        workspaceId,
        foundSignatureId,
        payload.eventName,
        payload.signerEmail,
      );
      
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Webhook processed successfully',
        folderId: payload.folderId,
        signatureId: foundSignatureId,
        eventName: payload.eventName,
      });
    } catch (error) {
      console.error('Failed to process RabbitSign webhook:', error);
      
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: error.message,
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
} 