import axios from 'axios';
import Cookies from 'universal-cookie';

export const checkUserLoginStatus = async () => {
    const url = process.env.NEXT_API_USER + '/auth/status';
    const cookies = new Cookies();
    const jwtToken = cookies.get('Authorization');
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error to check user login status:', error.response?.data);
        return {
          success: false,
          error: error.response?.data?.message || ['An unexpected error occurred'],
        };
      } else {
        console.error('Error to check user login status:', error);
        return { success: false, error: ['An unexpected error occurred'] };
      }
    }
  };