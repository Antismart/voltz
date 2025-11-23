'use client';

import { useState } from 'react';
import { QrReader } from '@yudiel/react-qr-scanner';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QRScannerProps {
  userId: string;
  eventId: string;
  onCheckIn?: (data: string) => void;
}

export function QRScanner({ userId, eventId, onCheckIn }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const qrData = JSON.stringify({
    userId,
    eventId,
    timestamp: Date.now(),
  });

  const handleScan = (result: any) => {
    if (result) {
      setScanResult(result.text);
      setIsScanning(false);
      onCheckIn?.(result.text);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="my-qr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-qr">
              <QrCode className="mr-2 h-4 w-4" />
              My QR Code
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Scan className="mr-2 h-4 w-4" />
              Scan Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-qr" className="space-y-4">
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="rounded-xl border-4 border-primary p-4">
                <QRCode
                  value={qrData}
                  size={256}
                  level="H"
                  includeMargin
                  fgColor="#8B5CF6"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Show this QR code at the event entrance
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Download QR Code
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-4">
            <div className="space-y-4">
              {!isScanning ? (
                <div className="flex flex-col items-center space-y-4 py-6">
                  <div className="flex h-64 w-64 items-center justify-center rounded-xl border-4 border-dashed">
                    <Scan className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button
                    variant="gradient"
                    onClick={() => setIsScanning(true)}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl">
                    <QrReader
                      onResult={handleScan}
                      constraints={{ facingMode: 'environment' }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsScanning(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {scanResult && (
                <div className="rounded-lg border border-green-500 bg-green-500/10 p-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Check-in successful!</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
