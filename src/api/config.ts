const useRemoteApi = false;

let API_URL = '';

if (useRemoteApi) {
    API_URL = 'https://uteq-connect-server-production.up.railway.app/api';
} else {
    API_URL = 'http://192.168.100.26:3000/api';
} 

export { API_URL };
