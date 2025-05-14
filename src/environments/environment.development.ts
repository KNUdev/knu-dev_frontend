const apiBaseUrl = '/api';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
};
