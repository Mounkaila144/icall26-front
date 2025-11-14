import { ModuleMenuConfig } from '@/src/shared/types/menu-config.types';

export const CustomersContractsMenuConfig: ModuleMenuConfig = {
    module: 'CustomersContracts',
    menus: [
        {
            id: 'ContractsList1',
            label: 'Contract',
            route: '/admin/CustomersContracts/ContractsList1',
            icon: {
                type: 'emoji',
                value: '🎯',
            },
            order: 20,
            module: 'CustomersContracts',
            isVisible: true,
            isActive: true,
        },
    ],
};