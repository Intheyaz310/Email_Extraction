import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageLayout } from '@/components/ui/page-layout';
import TopRightMenu from '@/components/ui/top-right-menu';
import { Loader2, Mail, FileText, Download, Upload, Settings } from 'lucide-react';

interface ExtractedJobInfo {
  job_title?: string;
  company_name?: string;
  location?: string;
  required_skills?: string[];
  salary_range?: string;
  job_type?: string;
  experience_level?: string;
  confidence_score?: number;
}

interface EmailExtractionProps {
  onExtract?: (data: ExtractedJobInfo) => void;
}

export default function EmailExtraction({ onExtract }: EmailExtractionProps) {
  const [emailText, setEmailText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedJobInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleTextExtraction = async () => {
    if (!emailText.trim()) {
      setError('Please enter email text to extract information from');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate API call to backend for text processing
      // In a real implementation, this would call your Python backend
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: emailText }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract information');
      }

      const data = await response.json();
      setExtractedData(data);
      onExtract?.(data);
    } catch (err) {
      // For demo purposes, simulate extraction with mock data
      const mockData: ExtractedJobInfo = {
        job_title: 'Senior Python Developer',
        company_name: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        required_skills: ['Python', 'React', 'AWS', 'Docker'],
        salary_range: '$120,000 - $150,000',
        job_type: 'Full-time',
        experience_level: '5+ years',
        confidence_score: 0.85,
      };
      
      setExtractedData(mockData);
      onExtract?.(mockData);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEmailText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (!extractedData) return;
    
    // Create CSV content
    const csvContent = `Job Title,Company,Location,Skills,Salary,Type,Experience,Confidence\n"${extractedData.job_title || ''}","${extractedData.company_name || ''}","${extractedData.location || ''}","${extractedData.required_skills?.join('; ') || ''}","${extractedData.salary_range || ''}","${extractedData.job_type || ''}","${extractedData.experience_level || ''}","${extractedData.confidence_score || ''}"`;
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_job_info.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="Email Job Information Extractor"
      description="Extract job information from emails using advanced NLP and AI techniques"
    >
      <TopRightMenu />
      <div className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Job Information Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-text">Email Text</Label>
                <Textarea
                  id="email-text"
                  placeholder="Paste your email text here..."
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  rows={8}
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Email File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.eml,.html"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {uploadedFile && (
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {uploadedFile.name}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button 
              onClick={handleTextExtraction} 
              disabled={isProcessing || !emailText.trim()}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Extract Information
                </>
              )}
            </Button>
            
            {extractedData && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Extracted Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                  <p className="text-lg font-semibold">{extractedData.job_title || 'Not found'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <p className="text-lg">{extractedData.company_name || 'Not found'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-lg">{extractedData.location || 'Not found'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Type</Label>
                  <p className="text-lg">{extractedData.job_type || 'Not found'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Required Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extractedData.required_skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    )) || <span className="text-muted-foreground">Not found</span>}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Salary Range</Label>
                  <p className="text-lg">{extractedData.salary_range || 'Not found'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience Level</Label>
                  <p className="text-lg">{extractedData.experience_level || 'Not found'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Confidence Score</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(extractedData.confidence_score || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((extractedData.confidence_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </PageLayout>
  );
}
