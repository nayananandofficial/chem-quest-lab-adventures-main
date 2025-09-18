import { supabase } from '../config/integrations/supabase/client.ts';

export const getLessons = async(req,res)=>{
    const {error, data} = await supabase.from('lessons').select('*').order('created_at', { ascending: true });
    if(error){
        return res.status(500).json({error: error.message});
    }else{
        return res.status(200).json(data);
    }
}

export const getLessonProgress = async(req, res)=>{
  const {userId} = req.params;
  const {error, data} = await supabase.from('user_lesson_progress')
        .select(`
          *,
          lessons (*)
        `)
        .eq('user_id', userId);
  if(error){
    return res.status(500).json({error: error.message});
  }else{
    return res.status(200).json(data);
  }

}

export const postLessonStart = async (req, res) => {
  const { user_id, lesson_id } = req.body;  
  if (!user_id || !lesson_id) {   
    return res.status(400).json({ error: "user_id and lesson_id are required" });   
  }    
  try{
    const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lesson.id,
            status: 'in_progress',
            progress_percentage: 10
          });
  }catch(error){
    return res.status(500).json({ error: error.message });
  }
}

export const updateLessonComplete = async (req, res)=>{
    const { user_id, lesson_id } = req.body;
    if (!user_id || !lesson_id) {
      return res.status(400).json({ error: "user_id and lesson_id are required" });
    }
    try{
      const { error } = await supabase
              .from('user_lesson_progress')
              .upsert({
                user_id: user_id,
                lesson_id: lesson_id,
                status: 'completed',
                progress_percentage: 100,
                completed_at: new Date().toISOString(),
                score: 85 + Math.floor(Math.random() * 15) // Random score between 85-100
              });
      if (error) throw error;
      res.status(200).json({ message: "Lesson marked as complete" });
    }catch(error){
      return res.status(500).json({ error: error.message });      
    }
}
