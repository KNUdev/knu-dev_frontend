const apiBaseUrl = 'https://knu-devbackend-production.up.railway.app';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
};
