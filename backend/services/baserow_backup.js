import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

class BaserowService {
 constructor() {
    this.baseURL = process.env.VITE_BASEROW_URL || process.env.BASEROW_API_URL;
    this.token = process.env.VITE_BASEROW_TOKEN || process.env.BASEROW_TOKEN;
    this.tableId = process.env.VITE_TABLE_ID || process.env.BASEROW_TABLE_ID;

    console.log('URL:', process.env.VITE_BASEROW_URL);
console.log('TOKEN:', process.env.VITE_BASEROW_TOKEN ? 'FOUND' : 'MISSING');
console.log('TABLE:', process.env.VITE_TABLE_ID);

    if (!this.token || !this.tableId) {
      console.warn('⚠️ Missing Baserow credentials in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: { 'Authorization': `Token ${this.token}` },
      timeout: 30000
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('Baserow API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

 async getRows(params = {}) {
  try {

    console.log('PARAMS=', params);

    const response = await this.client.get(
      `/api/database/rows/table/${this.tableId}/`,
      { params }
    );

    return response.data;

  } catch (error) {

    console.log('STATUS=', error.response?.status);
    console.log('DATA=', error.response?.data);

    throw new Error(`Failed to fetch rows: ${error.message}`);
  }
}

  async getRow(rowId) {
    try {
      const response = await this.client.get(`/api/database/rows/table/${this.tableId}/${rowId}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch row: ${error.message}`);
    }
  }

  async createRow(data) {
  try {
    console.log('UPLOAD DATA=', JSON.stringify(data, null, 2));

    const response = await this.client.post(
      `/api/database/rows/table/${this.tableId}/`,
      data
    );

    return response.data;

  } catch (error) {

    console.log('STATUS=', error.response?.status);
    console.log('ERROR DATA=', error.response?.data);
    console.log('UPLOAD PAYLOAD=', data);

    throw new Error(
      `Failed to create row: ${
        JSON.stringify(error.response?.data) || error.message
      }`
    );
  }
}

  async updateRow(rowId, data) {
    try {
      const response = await this.client.patch(`/api/database/rows/table/${this.tableId}/${rowId}/`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update row: ${error.message}`);
    }
  }

  async deleteRow(rowId) {
    try {
      await this.client.delete(`/api/database/rows/table/${this.tableId}/${rowId}/`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete row: ${error.message}`);
    }
  }

  async searchRows(query, params = {}) {
    try {
      const response = await this.client.get(`/api/database/rows/table/${this.tableId}/`, {
        params: { search: query, size: 100, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search rows: ${error.message}`);
    }
  }

  async filterRows(filters = {}) {
    try {
      const response = await this.client.get(`/api/database/rows/table/${this.tableId}/`, {
        params: { size: 400, ...filters }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to filter rows: ${error.message}`);
    }
  }
}

export default new BaserowService();
