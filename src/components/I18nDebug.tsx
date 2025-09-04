// I18n Debug component has been removed - application is now English-only
// This component is no longer needed as i18n system has been removed

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function I18nDebug() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🇨🇭 YogaSwiss Configuration
            <Badge variant="secondary">English Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Swiss Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Language:</strong> English</p>
                <p><strong>Region:</strong> Switzerland</p>
                <p><strong>Currency:</strong> CHF</p>
              </div>
              <div>
                <p><strong>Timezone:</strong> Europe/Zurich</p>
                <p><strong>VAT Rate:</strong> 7.7%</p>
                <p><strong>Format:</strong> Swiss</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Application Status</h4>
            <p className="text-sm text-green-700">
              i18n system has been successfully removed. Application is now English-only with Swiss formatting and business rules.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}