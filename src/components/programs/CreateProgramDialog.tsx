import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProgramDialog({ open, onOpenChange }: CreateProgramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Program Title</Label>
            <Input placeholder="e.g., Advanced Flexibility Training" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coaching">Life Coaching</SelectItem>
                  <SelectItem value="mobility">Mobility & Flexibility</SelectItem>
                  <SelectItem value="reiki">Energy Healing</SelectItem>
                  <SelectItem value="private_class">Private Classes</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="assessment">Assessments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delivery Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In-Person Only</SelectItem>
                  <SelectItem value="online">Online Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Session Length (Minutes)</Label>
              <Input type="number" placeholder="60" />
            </div>
            <div>
              <Label>Instructor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Kumar</SelectItem>
                  <SelectItem value="elena">Elena Varga</SelectItem>
                  <SelectItem value="maria">Maria Santos</SelectItem>
                  <SelectItem value="david">David Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Brief description of the program..." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="multi_session" />
            <Label htmlFor="multi_session">Multi-session program</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="intake_form" />
            <Label htmlFor="intake_form">Require intake form</Label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button>Create Program</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}