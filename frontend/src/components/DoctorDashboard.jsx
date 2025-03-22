'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function DoctorDashboard({ pendingQueries, handleApproveQuery, handleRejectQuery }) {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [notes, setNotes] = useState('');

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-medium">
            <span className="gradient-text">Pending Patient Queries</span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-y-auto h-[calc(70vh-4rem)]">
          {pendingQueries.length === 0 ? (
            <CardContent>
              <p className="text-center text-muted-foreground">No pending queries</p>
            </CardContent>
          ) : (
            <ul className="divide-y divide-border">
              {pendingQueries.map(query => (
                <li
                  key={query.id}
                  onClick={() => {
                    setSelectedQuery(query);
                    setNotes('');
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedQuery?.id === query.id ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-foreground">{query.patientName}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {query.query}
                      </p>
                    </div>
                    <Badge variant={getBadgeVariant(query.status)} className="ml-2">
                      {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                    </Badge>
                  </div>
                  {query.isUrgent && (
                    <Badge variant="destructive" className="mt-2">Urgent</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
      
      <Card className="lg:col-span-2">
        {selectedQuery ? (
          <div className="h-[70vh] flex flex-col">
            <CardHeader className="bg-primary/5 border-b flex flex-row justify-between items-center">
              <div>
                <CardTitle className="text-lg font-medium gradient-text">
                  Patient: {selectedQuery.patientName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted {new Date(selectedQuery.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {selectedQuery.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApproveQuery(selectedQuery.id)}
                      variant="default"
                      size="sm"
                      className="bg-success hover:bg-success/90"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectQuery(selectedQuery.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Patient Query</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground">{selectedQuery.query}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Generated Response</h3>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-foreground">{selectedQuery.aiResponse}</p>
                </div>
              </div>
              
              {(selectedQuery.status === 'approved' || selectedQuery.status === 'rejected') && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Decision</h3>
                  <div className={`p-4 rounded-lg ${
                    selectedQuery.status === 'approved' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    <p className="font-medium text-foreground">
                      {selectedQuery.status === 'approved' 
                        ? 'You approved this AI response' 
                        : 'You rejected this AI response'}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Add Notes (Optional)</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px]"
                  placeholder="Add any additional notes or modifications to the AI response..."
                />
              </div>
            </CardContent>
          </div>
        ) : (
          <div className="h-[70vh] flex items-center justify-center text-muted-foreground">
            <p>Select a patient query to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
}