// TODO uncomment for local developing
// const apiBaseUrl = 'http://localhost:5001';

// TODO NOT delete we use it for test-env
const apiBaseUrl = 'https://knu-devbackend-production.up.railway.app';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
};
