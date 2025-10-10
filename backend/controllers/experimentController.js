import { supabase } from '../config/integrations/supabase/client.ts';

export const createUserExperiment = async (req, res)=>{
  const {experimentData} = req.body;  
  const { data, error } = await supabase
    .from("user_experiments")
    .insert(experimentData)
    .select();

    console.log(data);
    
  if(error){
    return res.status(500).json({message: error.message});
  }else{
    return res.status(200).json(data);
  }  
}