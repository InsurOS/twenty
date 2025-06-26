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

    // Get existing signers with their person relations to access email
    const existingSigners = await rabbitSignSignerRepository.find({
      where: { signatureId },
      relations: ['person'],
      order: { signingOrder: 'ASC' },
    });

    // Update signers based on signing order (since we don't have email in signer entity)
    // This assumes the order of signers in the webhook matches the order in our database
    for (let i = 0; i < Math.min(existingSigners.length, rabbitSignData.signers.length); i++) {
      const existingSigner = existingSigners[i];
      const rabbitSigner = rabbitSignData.signers[i];
      
      if (existingSigner && rabbitSigner) {
        await rabbitSignSignerRepository.update(
          { id: existingSigner.id },
          { 
            status: rabbitSigner.status,
            // Optionally update signing order if it changed
            signingOrder: rabbitSigner.signingOrder,
          }
        );
      }
    }

    // If there are more webhook signers than existing signers, log a warning
    if (rabbitSignData.signers.length > existingSigners.length) {
      console.warn(`More signers in webhook (${rabbitSignData.signers.length}) than in database (${existingSigners.length}) for signature ${signatureId}`);
    }
  }
} 