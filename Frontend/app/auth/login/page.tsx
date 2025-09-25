'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/ui/logo';
import { Eye, EyeOff, AlertCircle, Shield, Zap, BarChart3, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(formData.email, formData.password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const demoAccounts = [
    { 
      role: 'Facultative Underwriter', 
      email: 'underwriter@kenyare.co.ke',
      description: 'Full access to submission processing and risk analysis'
    },
    { 
      role: 'Portfolio Manager', 
      email: 'portfolio@kenyare.co.ke',
      description: 'Portfolio monitoring and concentration analysis'
    },
    { 
      role: 'Senior Manager', 
      email: 'manager@kenyare.co.ke',
      description: 'Strategic overview and performance metrics'
    },
  ];

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'AI-Powered Analysis',
      description: 'Automated risk assessment and pricing recommendations'
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Risk Management',
      description: 'Real-time portfolio monitoring and concentration limits'
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Market Insights',
      description: 'Competitive intelligence and market trend analysis'
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      title: 'Automated Reporting',
      description: 'Generate acceptance/decline letters and compliance reports'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Logo size="xl" variant="full" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kenya Re Facultative Decision Support System
            </h1>
            <p className="text-lg text-gray-600">
              AI-powered decision support for facultative reinsurance underwriting
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Login Form */}
            <div className="max-w-md mx-auto w-full">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your credentials to access the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@kenyare.co.ke"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Demo Accounts */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Demo Accounts:</p>
                    <div className="space-y-2">
                      {demoAccounts.map((account) => (
                        <Button
                          key={account.email}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => setFormData({ 
                            email: account.email, 
                            password: 'demo123' 
                          })}
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {account.role}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {account.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {account.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Password for all demo accounts: <code className="bg-gray-100 px-1 rounded">demo123</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features and Benefits */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Transform Your Facultative Underwriting
                </h2>
                <p className="text-gray-600 mb-6">
                  KRFDS leverages artificial intelligence to streamline facultative reinsurance 
                  decision-making, providing faster, more consistent, and data-driven recommendations 
                  for your underwriting team.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-red-50 to-blue-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Key Benefits
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Reduce submission processing time by up to 70%
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Improve underwriting consistency and accuracy
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Real-time portfolio impact analysis
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Comprehensive audit trails and compliance reporting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;