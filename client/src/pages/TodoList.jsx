import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { CheckSquare, Plus, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const API_BASE = "http://travel-server.test/api";

const TodoList = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Function FetchTasks
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/todos?user_id=${user.id}`);
      const response = await res.json();

      if (response.status && Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
        toast({ title: 'Error: Invalid data format from server', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error fetching tasks', description: err.message, variant: 'destructive' });
      setTasks([]);
    }
    setIsLoading(false);
  }, [user]);
  //Function AddedTasks
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      try {
        const res = await fetch(`${API_BASE}/todos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, task: newTask }),
        });
        const response = await res.json();

        if (response.status) {
          setNewTask('');
          toast({ title: "Task Added" });
          await fetchTasks(); // Refresh list from server
        } else {
          toast({ title: 'Error: Could not add task', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Error adding task', description: err.message, variant: 'destructive' });
      }
    }
  };


  // To FetchData
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  //Function Toggle Task
  const handleToggleTask = async (id, completed) => {
    try {
      await fetch(`${API_BASE}/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed })
      });
      setTasks(tasks.map(task => task.id === id ? { ...task, completed: !completed } : task));
    } catch (err) {
      toast({ title: 'Error updating task', description: err.message, variant: 'destructive' });
    }
  };
  // Funtion Delete Task
  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/todos/${id}`, { method: "DELETE" });
      setTasks(tasks.filter(task => task.id !== id));
      toast({ title: "Task Deleted", variant: "destructive" });
    } catch (err) {
      toast({ title: 'Error deleting task', description: err.message, variant: 'destructive' });
    }
  };
  // Number of remaining tasks
  const remainingTasks = tasks.filter(task => !task.completed).length;

  return (
    <>
      <Helmet><title>{t('todolist')} - SaaS Management System</title></Helmet>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-gradient flex items-center space-x-3">
            <CheckSquare className="h-8 w-8" /><span>{t('todolist')}</span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect">
            {/* Number of remaining tasks:  */}
            <CardHeader>
              <CardTitle>{t('tasksRemaining', { count: remainingTasks })}</CardTitle>
              <CardDescription>Manage your daily tasks and stay productive.</CardDescription>
            </CardHeader>

            {/* Form addTassk Button +  */}
            <CardContent>
              <form onSubmit={handleAddTask} className="flex space-x-3 mb-6">
                <Input placeholder={t('enterNewTask')} value={newTask} onChange={(e) => setNewTask(e.target.value)} className="flex-1" />
                <Button type="submit" className="button-gradient shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />{t('add')}
                </Button>
              </form>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {/* isloading == true lodding if false fetchData  */}
                {isLoading ? <div className="flex justify-center py-10"><Loader className="h-8 w-8 animate-spin text-primary" /></div> :
                  <AnimatePresence>
                    {tasks.map((task) => (
                      <motion.div key={task.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} transition={{ duration: 0.3 }} className={`flex items-center p-3 rounded-lg transition-all duration-300 ${task.completed ? 'text-red-700  bg-muted/50' : 'text-red-700 bg-accent'}`}>
                        {/* Toggle Task When Click  */}
                        <button onClick={() => handleToggleTask(task.id, task.completed)} className="mr-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                            {task.completed && <CheckSquare className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.task}</span>
                        {/* Delete Button  */}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                }
                {/* Empty tasks  */}
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
