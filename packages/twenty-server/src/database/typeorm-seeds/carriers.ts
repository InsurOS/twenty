import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

const tableName = 'carrier';

export const DEV_SEED_CARRIER_IDS = {
  PROGRESSIVE: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
  STATE_FARM: '20202020-ac73-4797-824e-87a1f5aea9e0',
  GEICO: '20202020-f517-42fd-80ae-14173b3b70ae',
  ALLSTATE: '20202020-eee1-4690-ad2c-8619e5b56a2e',
  LIBERTY_MUTUAL: '20202020-6784-4449-afdf-dc62cb8702f2',
};

export const seedCarriers = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'website',
      'phoneNumber',
      'email',
      'address',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_CARRIER_IDS.PROGRESSIVE,
        name: 'Progressive Insurance',
        website: 'https://www.progressive.com',
        phoneNumber: '1-800-776-4737',
        email: 'contact@progressive.com',
        address: '6300 Wilson Mills Rd, Mayfield Village, OH 44143',
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
        createdByName: 'System',
      },
      {
        id: DEV_SEED_CARRIER_IDS.STATE_FARM,
        name: 'State Farm',
        website: 'https://www.statefarm.com',
        phoneNumber: '1-800-782-8332',
        email: 'contact@statefarm.com',
        address: '1 State Farm Plaza, Bloomington, IL 61710',
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
        createdByName: 'System',
      },
      {
        id: DEV_SEED_CARRIER_IDS.GEICO,
        name: 'GEICO',
        website: 'https://www.geico.com',
        phoneNumber: '1-800-841-3000',
        email: 'contact@geico.com',
        address: '5260 Western Ave, Chevy Chase, MD 20815',
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
        createdByName: 'System',
      },
      {
        id: DEV_SEED_CARRIER_IDS.ALLSTATE,
        name: 'Allstate Insurance',
        website: 'https://www.allstate.com',
        phoneNumber: '1-800-255-7828',
        email: 'contact@allstate.com',
        address: '2775 Sanders Rd, Northbrook, IL 60062',
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
        createdByName: 'System',
      },
      {
        id: DEV_SEED_CARRIER_IDS.LIBERTY_MUTUAL,
        name: 'Liberty Mutual Insurance',
        website: 'https://www.libertymutual.com',
        phoneNumber: '1-800-837-5254',
        email: 'contact@libertymutual.com',
        address: '175 Berkeley St, Boston, MA 02116',
        createdBySource: 'MANUAL',
        createdByWorkspaceMemberId: '20202020-1c0e-494c-a1b6-85b1c6fefaa5',
        createdByName: 'System',
      },
    ])
    .execute();
};
