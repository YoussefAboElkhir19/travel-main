import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { CheckSquare, Plus, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from '@/components/ui/use-toast';

const TodoList = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!supabase || !user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Error fetching tasks', description: error.message, variant: 'destructive' });
    else setTasks(data || []);
    setIsLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim() && supabase) {
      const { data, error } = await supabase
        .from('todos')
        .insert({ user_id: user.id, title: newTask })
        .select()
        .single();
      if (error) toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
      else {
        setTasks(prev => [data, ...prev]);
        setNewTask('');
        toast({ title: "Task Added" });
      }
    }
  };

  const handleToggleTask = async (id, completed) => {
    if (!supabase) return;
    const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id);
    if (error) toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    else setTasks(tasks.map(task => task.id === id ? { ...task, completed: !completed } : task));
  };

  const handleDeleteTask = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) toast({ title: 'Error deleting task', description: error.message, variant: 'destructive' });
    else {
      setTasks(tasks.filter(task => task.id !== id));
      toast({ title: "Task Deleted", variant: "destructive" });
    }
  };

  const remainingTasks = tasks.filter(task => !task.completed).length;

  return (
    <>
      <Helmet><title>{t('todolist')} - SaaS Management System</title></Helmet>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}><h1 className="text-3xl font-bold text-gradient flex items-center space-x-3"><CheckSquare className="h-8 w-8" /><span>{t('todolist')}</span></h1></motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect">
            <CardHeader><CardTitle>{t('tasksRemaining', { count: remainingTasks })}</CardTitle><CardDescription>Manage your daily tasks and stay productive.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="flex space-x-3 mb-6"><Input placeholder={t('enterNewTask')} value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" /><Button type="submit" className="button-gradient shadow-lg"><Plus className="h-4 w-4 mr-2" />{t('add')}</Button></form>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {isLoading ? <div className="flex justify-center py-10"><Loader className="h-8 w-8 animate-spin text-primary" /></div> :
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.div key={task.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} transition={{ duration: 0.3 }} className={`flex items-center p-3 rounded-lg transition-all duration-300 ${task.completed ? 'bg-muted/50' : 'bg-accent'}`}>
                        <button onClick={() => handleToggleTask(task.id, task.completed)} className="mr-4"><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>{task.completed && <CheckSquare className="h-4 w-4 text-primary-foreground" />}</div></button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                }
                {!isLoading && tasks.length === 0 && (<div className="text-center py-10 text-muted-foreground"><p>Your to-do list is empty. Add a new task to get started!</p></div>)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};
export default TodoList;