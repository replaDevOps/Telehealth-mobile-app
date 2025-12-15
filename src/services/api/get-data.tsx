import axios from './api-client';
import { BASE_URL } from '@constants/api';

const getData = async (url: string = '', params: any = {}) => {
  return await axios.get(BASE_URL + url, { ...params });
};
export default getData;
