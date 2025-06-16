
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, MapPin, CreditCard, User, Phone, Mail, CheckCircle, Bus, Wifi, Coffee, Monitor, Snowflake, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';

interface ReceiptTemplate {
  company_name: string;
  company_tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_gradient: string;
  header_font: string;
  body_font: string;
  header_style: string;
  show_qr_code: boolean;
  show_fleet_details: boolean;
  show_weather_info: boolean;
  header_message?: string;
  footer_message: string;
  terms_and_conditions?: string;
  promotional_message?: string;
  logo_url?: string;
}

interface EnhancedReceiptData {
  receipt_id: string;
  receipt_number: string;
  passenger_name: string;
  passenger_phone?: string;
  passenger_email?: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  seat_numbers: string[];
  amount_paid: number;
  generated_at: string;
  branch_name: string;
  branch_address: string;
  payment_method?: string;
  payment_status?: string;
  booking_id?: string;
  fleet_name?: string;
  fleet_description?: string;
  fleet_features?: string[];
  fleet_capacity?: number;
  fleet_image_url?: string;
  bus_id?: string;
  receipt_status?: string;
  branch_id?: string;
}

interface UltraPremiumReceiptGeneratorProps {
  receiptData: EnhancedReceiptData;
  onDownload?: () => void;
  branchId?: string;
}

const getFeatureIcon = (feature: string) => {
  const lowerFeature = feature.toLowerCase();
  if (lowerFeature.includes('wifi') || lowerFeature.includes('internet')) return <Wifi className="h-4 w-4" />;
  if (lowerFeature.includes('coffee') || lowerFeature.includes('refreshment')) return <Coffee className="h-4 w-4" />;
  if (lowerFeature.includes('tv') || lowerFeature.includes('entertainment')) return <Monitor className="h-4 w-4" />;
  if (lowerFeature.includes('ac') || lowerFeature.includes('air')) return <Snowflake className="h-4 w-4" />;
  return <CheckCircle className="h-4 w-4" />;
};

export const UltraPremiumReceiptGenerator: React.FC<UltraPremiumReceiptGeneratorProps> = ({ 
  receiptData, 
  onDownload,
  branchId
}) => {
  const [template, setTemplate] = useState<ReceiptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        // Use the branch_id from receiptData if available, otherwise use the provided branchId
        const targetBranchId = receiptData.branch_id || branchId;
        
        const { data, error } = await supabase.rpc('get_receipt_template', {
          p_branch_id: targetBranchId || null
        });

        if (error) {
          console.error('Error fetching receipt template:', error);
        } else if (data && typeof data === 'object') {
          setTemplate(data as unknown as ReceiptTemplate);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [branchId, receiptData.branch_id]);

  const handlePrint = () => {
    window.print();
  };

  const qrCodeData = JSON.stringify({
    receipt_id: receiptData.receipt_id,
    receipt_number: receiptData.receipt_number,
    amount: receiptData.amount_paid,
    date: receiptData.generated_at,
    fleet: receiptData.fleet_name,
    status: receiptData.receipt_status || 'pending'
  });

  // Default template if loading or no template found
  const defaultTemplate: ReceiptTemplate = {
    company_name: 'RouteAura Bus Services',
    company_tagline: 'Your Trusted Travel Partner',
    primary_color: '#2563eb',
    secondary_color: '#16a34a',
    accent_color: '#dc2626',
    background_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    header_font: 'Inter',
    body_font: 'Inter',
    header_style: 'gradient',
    show_qr_code: true,
    show_fleet_details: true,
    show_weather_info: false,
    footer_message: 'Thank you for choosing our services!'
  };

  const activeTemplate = template || defaultTemplate;

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'signed_off':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <Card className="receipt-container shadow-none print:shadow-none print:border-none overflow-hidden">
        {/* Ultra Premium Header */}
        <CardHeader 
          className="text-center border-b-2 text-white print:bg-gradient-to-r relative overflow-hidden p-0"
          style={{ 
            background: activeTemplate.background_gradient,
            borderBottomColor: activeTemplate.primary_color
          }}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {activeTemplate.logo_url && (
                  <img 
                    src={activeTemplate.logo_url} 
                    alt="Company Logo" 
                    className="h-16 w-auto mx-auto mb-4"
                  />
                )}
                <h1 
                  className="text-4xl font-bold mb-2"
                  style={{ fontFamily: activeTemplate.header_font }}
                >
                  {activeTemplate.company_name}
                </h1>
                <p className="text-lg opacity-90 mb-1">
                  {activeTemplate.company_tagline}
                </p>
                {activeTemplate.header_message && (
                  <p className="text-sm opacity-80 italic">
                    {activeTemplate.header_message}
                  </p>
                )}
              </div>
              
              {activeTemplate.show_qr_code && (
                <div className="flex flex-col items-center ml-8">
                  <div className="bg-white p-3 rounded-xl shadow-lg mb-2">
                    <QRCodeSVG 
                      value={qrCodeData} 
                      size={100}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs opacity-80">Scan to Verify</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">OFFICIAL RECEIPT</p>
                  <p className="text-lg opacity-90">
                    Receipt No: <span className="font-bold">{receiptData.receipt_number}</span>
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`${getReceiptStatusColor(receiptData.receipt_status || 'pending')} text-sm`}>
                    {receiptData.receipt_status?.charAt(0).toUpperCase() + receiptData.receipt_status?.slice(1) || 'Pending'}
                  </Badge>
                  {receiptData.receipt_status === 'signed_off' && (
                    <div className="mt-2 flex items-center text-green-100 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified & Signed Off
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Receipt Status Warning */}
          {receiptData.receipt_status === 'signed_off' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-bold text-green-800">Receipt Verified & Signed Off</p>
                  <p className="text-green-700 text-sm">This receipt has been officially verified by an admin and cannot be used again.</p>
                </div>
              </div>
            </div>
          )}

          {/* Branch Information */}
          <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200">
            <h3 className="font-bold text-xl text-gray-800 mb-2">{receiptData.branch_name}</h3>
            <p className="text-gray-600 mb-3">{receiptData.branch_address}</p>
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Authorized Service Provider</span>
            </div>
          </div>

          {/* Main Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Passenger Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-gray-800 flex items-center border-b-2 border-blue-200 pb-3">
                <User className="h-6 w-6 mr-3 text-blue-600" />
                Passenger Details
              </h4>
              <div className="bg-blue-50 p-6 rounded-xl space-y-4 border-2 border-blue-200">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-bold text-gray-900">{receiptData.passenger_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-bold text-gray-900">{receiptData.passenger_phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-bold text-gray-900">{receiptData.passenger_email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Information */}
            <div className="space-y-4">
              <h4 className="font-bold text-xl text-gray-800 flex items-center border-b-2 border-green-200 pb-3">
                <Calendar className="h-6 w-6 mr-3 text-green-600" />
                Journey Details
              </h4>
              <div className="bg-green-50 p-6 rounded-xl space-y-4 border-2 border-green-200">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Travel Date</p>
                    <p className="font-bold text-gray-900">{receiptData.departure_date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-5 w-5 mr-3 flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Departure - Arrival</p>
                    <p className="font-bold text-gray-900">
                      {receiptData.departure_time} - {receiptData.arrival_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Bus className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Seat Numbers</p>
                    <p className="font-bold text-gray-900">{receiptData.seat_numbers?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200">
            <h4 className="font-bold text-xl text-gray-800 flex items-center mb-6">
              <MapPin className="h-6 w-6 mr-3 text-indigo-600" />
              Travel Route
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div 
                  className="text-white p-6 rounded-xl shadow-lg mb-2"
                  style={{ backgroundColor: activeTemplate.primary_color }}
                >
                  <p className="font-bold text-lg">{receiptData.from_location}</p>
                  <p className="text-sm opacity-90">Departure Point</p>
                </div>
              </div>
              <div className="flex-1 flex justify-center items-center">
                <div className="border-t-4 border-dashed border-indigo-400 w-full mx-8 relative">
                  <Bus className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1" />
                </div>
              </div>
              <div className="text-center flex-1">
                <div 
                  className="text-white p-6 rounded-xl shadow-lg mb-2"
                  style={{ backgroundColor: activeTemplate.secondary_color }}
                >
                  <p className="font-bold text-lg">{receiptData.to_location}</p>
                  <p className="text-sm opacity-90">Destination</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Information */}
          {activeTemplate.show_fleet_details && receiptData.fleet_name && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-800 flex items-center mb-4">
                <Bus className="h-5 w-5 mr-2 text-gray-600" />
                Fleet Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-900 mb-2">{receiptData.fleet_name}</p>
                  <p className="text-gray-600 text-sm mb-3">{receiptData.fleet_description}</p>
                  <p className="text-sm text-gray-600">Capacity: <span className="font-medium">{receiptData.fleet_capacity} seats</span></p>
                </div>
                {receiptData.fleet_features && receiptData.fleet_features.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-800 mb-2">Features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {receiptData.fleet_features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-700">
                          {getFeatureIcon(feature)}
                          <span className="ml-2">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-xl border-2 border-emerald-200">
            <h4 className="font-bold text-xl text-gray-800 flex items-center mb-6">
              <CreditCard className="h-6 w-6 mr-3 text-emerald-600" />
              Payment Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-gray-700">Amount Paid:</span>
                  <span className="font-bold text-gray-900">KSh {receiptData.amount_paid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                  <span className="text-gray-700">Payment Method:</span>
                  <span className="text-gray-900">{receiptData.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Status:</span>
                  <Badge variant={receiptData.payment_status === 'Paid' ? 'default' : 'secondary'}>
                    {receiptData.payment_status || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center bg-white p-6 rounded-xl shadow-lg border-2 border-emerald-300">
                  <p className="text-3xl font-bold text-emerald-600 mb-2">
                    KSh {receiptData.amount_paid?.toLocaleString()}
                  </p>
                  <p className="text-emerald-700 font-medium">Total Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Metadata */}
          <div className="bg-gray-100 p-6 rounded-xl border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Receipt ID:</span>
                  <p className="font-mono text-xs text-gray-900 break-all">{receiptData.receipt_id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <p className="font-mono text-xs text-gray-900 break-all">{receiptData.booking_id}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Generated:</span>
                  <p className="text-gray-900">
                    {receiptData.generated_at ? new Date(receiptData.generated_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
                {receiptData.bus_id && (
                  <div>
                    <span className="font-medium text-gray-700">Bus ID:</span>
                    <p className="font-mono text-xs text-gray-900">{receiptData.bus_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 border-t-2 border-gray-200 pt-8 space-y-4">
            <div 
              className="text-white p-6 rounded-xl"
              style={{ backgroundColor: activeTemplate.primary_color }}
            >
              <p className="font-bold text-xl mb-2">{activeTemplate.footer_message}</p>
              <p className="opacity-90">Keep this receipt for your records and present it during travel.</p>
            </div>
            
            {activeTemplate.promotional_message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">{activeTemplate.promotional_message}</p>
              </div>
            )}
            
            {activeTemplate.terms_and_conditions && (
              <div className="text-xs text-gray-500 max-w-2xl mx-auto">
                <p className="font-medium mb-2">Terms and Conditions:</p>
                <p>{activeTemplate.terms_and_conditions}</p>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-4">
              This is an official receipt generated by {activeTemplate.company_name} booking system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Print and Download Controls */}
      <div className="flex justify-center space-x-4 mt-6 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Print Receipt
        </Button>
        {onDownload && (
          <Button onClick={onDownload} size="lg">
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5in;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};
