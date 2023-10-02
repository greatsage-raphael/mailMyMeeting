const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


class SupabaseDB {
  
    async getJSONRecords() {
      let { data: users, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return users;
    }
  
    async findUser(id, emailAddress) {
      let { data: users, error } = await supabase.from('users')
        .select('*')
        .eq('id', id)
        .or(`email_address.eq.${emailAddress}`);
      
      if (error) throw error;
      return users[0]; // since find is expected to return a single record
    }
  
    async updateUser(id, payload) {
      let { data: users, error } = await supabase.from('users')
        .update(payload)
        .eq('id', id);
      
      if (error) throw error;
      return users[0];
    }
  
    async createUser(payload) {
      const { data: users, error } = await supabase.from('users')
        .insert([payload])
        .single(); // Returns only one inserted record
      
      if (error) throw error;
      return users;
    }
  
    async createOrUpdateUser(id, attributes) {
      const record = await this.findUser(id, attributes?.emailAddress);
      if (record) {
        return await this.updateUser(record.id, attributes);
      } else {
        return await this.createUser(attributes);
      }
    }
  }
  
  const db = new SupabaseDB();
  module.exports = db;
  