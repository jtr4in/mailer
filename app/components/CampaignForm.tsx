import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import Papa from 'papaparse'; // Add this import for CSV parsing

// ... existing imports and schema ...

export function CampaignForm() {
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      // ... other default values ...
    },
  });

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('campaignFormData');
    if (savedFormData) {
      form.reset(JSON.parse(savedFormData));
    }
  }, []);

  // Auto-save functionality
  const autoSave = () => {
    const formData = form.getValues();
    localStorage.setItem('campaignFormData', JSON.stringify(formData));
    toast({
      title: 'Auto-saved',
      description: 'Your changes have been automatically saved.',
    });
  };

  // Set up auto-save timer
  useEffect(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(autoSave, 5000); // Auto-save after 5 seconds of inactivity
    setAutoSaveTimer(timer);
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [form.watch()]);

  // CSV import function
  const importCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const csvData = results.data[0] as Record<string, string>;
            form.reset({
              name: csvData.name || '',
              description: csvData.description || '',
              // ... map other fields as needed ...
            });
            toast({
              title: 'CSV Imported',
              description: 'Campaign data has been imported from CSV.',
            });
          }
        },
        header: true,
      });
    }
  };

  // ... existing onSubmit function ...

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* CSV Import Button */}
      <div>
        <Input
          type="file"
          accept=".csv"
          onChange={importCSV}
          className="hidden"
          id="csvImport"
        />
        <label htmlFor="csvImport" className="cursor-pointer">
          <Button type="button" variant="outline">
            Import from CSV
          </Button>
        </label>
      </div>

      {/* ... existing form fields ... */}

      <Button type="submit">Submit</Button>
    </form>
  );
}