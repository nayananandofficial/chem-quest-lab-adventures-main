import { supabase } from '../config/integrations/supabase/client.ts';

export const getChemicals = async(req, res) => {
  const {error, data} = await supabase.from('chemicals').select('*');
  if(error){
    return res.status(500).json({error: error.message});
  }else{
    return res.status(200).json(data);
  }
}