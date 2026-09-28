/**
 * Mock Implementation of Read-Only IManagerRepository
 */
import { IManagerRepository, ManagerStatusFilter, TerritoryHierarchyItem } from '../IManagerRepository';
import { DivisionName, Manager, ManagerRole } from '../../../types';

const INITIAL_MOCK_MANAGERS: Manager[] = [
  // Tamil Nadu (st-tn-01)
  {
    id: 'mgr-000',
    name: 'Ramesh',
    email: 'ramesh@forgeindia.in',
    phone: '9876543200',
    role: ManagerRole.STATE_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    employeeId: 'FM1000',
    territoryName: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mgr-tn-dt1',
    name: 'Suresh Menon',
    email: 'suresh.m@forgeindia.in',
    phone: '9876543213',
    role: ManagerRole.DISTRICT_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    employeeId: 'FM1004',
    territoryName: 'Chennai District',
    status: 'ACTIVE',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'mgr-tn-div1',
    name: 'K. Ananth',
    email: 'ananth.k@forgeindia.in',
    phone: '9876543217',
    role: ManagerRole.DIVISION_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    divisionName: DivisionName.NORTH,
    employeeId: 'FM1005',
    territoryName: 'Chennai North Division',
    status: 'ACTIVE',
    createdAt: '2025-01-06T00:00:00Z',
    updatedAt: '2025-01-06T00:00:00Z',
  },
  {
    id: 'mgr-tn-div2',
    name: 'P. Meena',
    email: 'meena.p@forgeindia.in',
    phone: '9876543218',
    role: ManagerRole.DIVISION_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-south',
    divisionName: DivisionName.SOUTH,
    employeeId: 'FM1009',
    territoryName: 'Chennai South Division',
    status: 'ACTIVE',
    createdAt: '2025-01-07T00:00:00Z',
    updatedAt: '2025-01-07T00:00:00Z',
  },
  {
    id: 'mgr-tn-pin1',
    name: 'M. Selvi',
    email: 'selvi.m@forgeindia.in',
    phone: '9876543219',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    employeeId: 'FM1006',
    territoryName: 'Parrys Pincode (600001)',
    status: 'ACTIVE',
    createdAt: '2025-01-08T00:00:00Z',
    updatedAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'mgr-tn-pin1-b',
    name: 'R. Dinesh',
    email: 'dinesh.r@forgeindia.in',
    phone: '9876543220',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600001',
    employeeId: 'FM1007',
    territoryName: 'Parrys Pincode (600001)',
    status: 'ACTIVE',
    createdAt: '2025-01-09T00:00:00Z',
    updatedAt: '2025-01-09T00:00:00Z',
  },
  {
    id: 'mgr-tn-pin2',
    name: 'S. Vijay',
    email: 'vijay.s@forgeindia.in',
    phone: '9876543221',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-north',
    pincodeId: '600010',
    employeeId: 'FM1008',
    territoryName: 'Kilpauk Pincode (600010)',
    status: 'ACTIVE',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'mgr-tn-pin3',
    name: 'V. Karthik',
    email: 'karthik.v@forgeindia.in',
    phone: '9876543222',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-chn-01',
    divisionId: 'div-chn-south',
    pincodeId: '600020',
    employeeId: 'FM1010',
    territoryName: 'Adyar Pincode (600020)',
    status: 'ACTIVE',
    createdAt: '2025-01-11T00:00:00Z',
    updatedAt: '2025-01-11T00:00:00Z',
  },
  {
    id: 'mgr-tn-dt2',
    name: 'R. Venkatesh',
    email: 'venkatesh.r@forgeindia.in',
    phone: '9876543223',
    role: ManagerRole.DISTRICT_MANAGER,
    stateId: 'st-tn-01',
    districtId: 'dt-cbe-01',
    employeeId: 'FM1011',
    territoryName: 'Coimbatore District',
    status: 'ACTIVE',
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },

  // Madhya Pradesh (st-mp-01)
  {
    id: 'mgr-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@forgeindia.in',
    phone: '9876543210',
    role: ManagerRole.DIVISION_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    divisionName: DivisionName.NORTH,
    employeeId: 'FM1001',
    territoryName: 'Indore District',
    status: 'ACTIVE',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'mgr-002',
    name: 'Priya Sharma',
    email: 'priya.s@forgeindia.in',
    phone: '9876543211',
    role: ManagerRole.DIVISION_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    divisionName: DivisionName.NORTH,
    employeeId: 'FM1002',
    territoryName: 'Indore Central',
    status: 'ACTIVE',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'mgr-003',
    name: 'Vikram Singh',
    email: 'vikram.s@forgeindia.in',
    phone: '9876543212',
    role: ManagerRole.DISTRICT_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    employeeId: 'FM1003',
    territoryName: 'Indore East',
    status: 'ACTIVE',
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'mgr-004',
    name: 'Arun Kumar',
    email: 'arun.k@forgeindia.in',
    phone: '9876543213',
    role: ManagerRole.DISTRICT_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    employeeId: 'FM1024',
    territoryName: 'Indore West',
    status: 'ACTIVE',
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    id: 'mgr-005',
    name: 'Rahul Kumar',
    email: 'rahul.k@forgeindia.in',
    phone: '9876543214',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452001',
    employeeId: 'FM1025',
    territoryName: 'Indore Rural',
    status: 'INACTIVE',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'mgr-006',
    name: 'Neha Gupta',
    email: 'neha.g@forgeindia.in',
    phone: '9876543215',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-north-01',
    pincodeId: '452002',
    employeeId: 'FM1026',
    territoryName: 'Indore South',
    status: 'ACTIVE',
    createdAt: '2025-01-18T00:00:00Z',
    updatedAt: '2025-01-18T00:00:00Z',
  },
  {
    id: 'mgr-007',
    name: 'Suresh Patel',
    email: 'suresh.p@forgeindia.in',
    phone: '9876543216',
    role: ManagerRole.PINCODE_MANAGER,
    stateId: 'st-mp-01',
    districtId: 'dt-indore-01',
    divisionId: 'div-south-01',
    pincodeId: '452003',
    employeeId: 'FM1027',
    territoryName: 'Bhopal West',
    status: 'INACTIVE',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
  },
];

export class MockManagerRepository implements IManagerRepository {
  private managers: Manager[] = [...INITIAL_MOCK_MANAGERS];

  async getManagersInScope(
    requestingManagerId: string,
    query?: string,
    statusFilter: ManagerStatusFilter = 'ALL',
  ): Promise<Manager[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const requester = await this.getManagerById(requestingManagerId);
    if (!requester) return [];

    let inScope = this.managers.filter(m => m.stateId === requester.stateId);

    if (statusFilter !== 'ALL') {
      inScope = inScope.filter(m => m.status === statusFilter);
    }

    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      inScope = inScope.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(q);
        const empMatch = m.employeeId ? m.employeeId.toLowerCase().includes(q) : false;
        const territoryMatch = m.territoryName ? m.territoryName.toLowerCase().includes(q) : false;
        const roleMatch = m.role.toLowerCase().includes(q);
        const pinMatch = m.pincodeId ? m.pincodeId.toLowerCase().includes(q) : false;
        return nameMatch || empMatch || territoryMatch || roleMatch || pinMatch;
      });
    }

    return inScope;
  }

  async getManagerById(id: string): Promise<Manager | null> {
    const found = this.managers.find(m => m.id === id);
    return found || null;
  }

  async getDistrictsInState(stateId: string): Promise<TerritoryHierarchyItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const managersInState = this.managers.filter(m => m.stateId === stateId);
    const districtIds = Array.from(new Set(managersInState.map(m => m.districtId).filter(Boolean))) as string[];

    return districtIds.map(dId => {
      const districtManagers = managersInState.filter(m => m.districtId === dId);
      const dmAssigned = districtManagers.find(m => m.role === ManagerRole.DISTRICT_MANAGER);
      const divisions = Array.from(new Set(districtManagers.map(m => m.divisionId).filter(Boolean)));
      
      let name = dId;
      if (dId === 'dt-chn-01') name = 'Chennai District';
      else if (dId === 'dt-cbe-01') name = 'Coimbatore District';
      else if (dId === 'dt-indore-01') name = 'Indore District';
      else if (dId === 'dt-bhopal-01') name = 'Bhopal District';
      else if (dmAssigned?.territoryName) name = dmAssigned.territoryName;

      return {
        id: dId,
        name,
        type: 'DISTRICT',
        stateId,
        districtId: dId,
        assignedManagerName: dmAssigned?.name,
        assignedManagerId: dmAssigned?.id,
        subItemCount: divisions.length,
        managerCount: districtManagers.length,
        status: 'ACTIVE',
      };
    });
  }

  async getDivisionsInDistrict(districtId: string): Promise<TerritoryHierarchyItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const managersInDistrict = this.managers.filter(m => m.districtId === districtId);
    const divisionIds = Array.from(new Set(managersInDistrict.map(m => m.divisionId).filter(Boolean))) as string[];

    return divisionIds.map(divId => {
      const divManagers = managersInDistrict.filter(m => m.divisionId === divId);
      const divAssigned = divManagers.find(m => m.role === ManagerRole.DIVISION_MANAGER);
      const pincodes = Array.from(new Set(divManagers.map(m => m.pincodeId).filter(Boolean)));

      let name = divId;
      if (divId === 'div-chn-north') name = 'Chennai North Division';
      else if (divId === 'div-chn-south') name = 'Chennai South Division';
      else if (divId === 'div-north-01') name = 'Indore North Division';
      else if (divId === 'div-south-01') name = 'Indore South Division';
      else if (divId === 'div-cbe-central') name = 'Coimbatore Central Division';
      else if (divAssigned?.territoryName) name = divAssigned.territoryName;

      return {
        id: divId,
        name,
        type: 'DIVISION',
        stateId: divManagers[0]?.stateId || '',
        districtId,
        divisionId: divId,
        divisionName: divManagers[0]?.divisionName,
        assignedManagerName: divAssigned?.name,
        assignedManagerId: divAssigned?.id,
        subItemCount: pincodes.length,
        managerCount: divManagers.length,
        status: 'ACTIVE',
      };
    });
  }

  async getPincodesInDivision(divisionId: string): Promise<TerritoryHierarchyItem[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const managersInDiv = this.managers.filter(m => m.divisionId === divisionId);
    const pincodeIds = Array.from(new Set(managersInDiv.map(m => m.pincodeId).filter(Boolean))) as string[];

    return pincodeIds.map(pId => {
      const pinManagers = managersInDiv.filter(m => m.pincodeId === pId);
      const pinAssigned = pinManagers.find(m => m.role === ManagerRole.PINCODE_MANAGER);

      return {
        id: pId,
        name: pinAssigned?.territoryName || `Pincode ${pId}`,
        type: 'PINCODE',
        stateId: pinManagers[0]?.stateId || '',
        districtId: pinManagers[0]?.districtId,
        divisionId,
        pincodeId: pId,
        assignedManagerName: pinAssigned?.name,
        assignedManagerId: pinAssigned?.id,
        subItemCount: pinManagers.length,
        managerCount: pinManagers.length,
        status: pinManagers.some(m => m.status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }

  async getManagersInPincode(pincodeId: string, statusFilter: ManagerStatusFilter = 'ALL'): Promise<Manager[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    let pinManagers = this.managers.filter(m => m.pincodeId === pincodeId);
    if (statusFilter !== 'ALL') {
      pinManagers = pinManagers.filter(m => m.status === statusFilter);
    }
    return pinManagers;
  }
}

