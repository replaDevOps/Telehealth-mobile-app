import axios from './api-client';
import { BASE_URL } from '@constants/api';

const postData = async (url: string = '', params: any = {}) => {
  console.log(BASE_URL + url, { ...params });
  return await axios.post(BASE_URL + url, { ...params });
};
export default postData;
