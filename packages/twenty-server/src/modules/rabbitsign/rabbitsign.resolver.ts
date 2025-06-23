import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneRabbitSignSignatureInput } from 'src/modules/rabbitsign/dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from 'src/modules/rabbitsign/dtos/create-one-rabbit-sign-signature.output';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class RabbitSignResolver {
  constructor(
    private readonly rabbitSignSignatureService: RabbitSignSignatureService,
  ) {}

  @Mutation(() => CreateOneRabbitSignSignatureOutput, {
    name: 'createRabbitSignSignatureWithExternalCall',
  })
  async createRabbitSignSignatureWithExternalCall(
    @Args('input') input: CreateOneRabbitSignSignatureInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CreateOneRabbitSignSignatureOutput> {
    // Extract workspaceId from the context
    const workspaceId = workspace.id;
    
    // Parse the signatures data
    const signatures = input.signaturesData ? JSON.parse(input.signaturesData) : [];
    
    // Convert signatures to signers format for RabbitSign
    const signers = signatures.map((signature: any) => ({
      email: signature.email,
      name: signature.name,
      signaturePosition: {
        x: signature.x,
        y: signature.y,
        width: signature.width,
        height: signature.height,
        pageIndex: signature.pageIndex,
      },
    }));

    const signature = await this.rabbitSignSignatureService.createSignatureWithExternalCall({
      title: input.title,
      workspaceMemberId: input.workspaceMemberId,
      workspaceId,
      pdfBuffer: input.pdfData ? Buffer.from(input.pdfData, 'base64') : undefined,
      signers,
    });

    return {
      id: signature.id,
    };
  }
}
