const apiBaseUrl = '/api';

export const environment = {
    production: true,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
};
