import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/api/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (isForgotPassword) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: makeRedirectUri({ scheme: 'wayzle' }) + 'reset-password',
        });
        if (error) throw error;
        Alert.alert('Success', 'Password reset instructions have been sent to your email.');
        setIsForgotPassword(false);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        Alert.alert('Registration Successful', 'We have sent a confirmation link to your email. Please verify your email to log in safely.');
        setIsSignUp(false); // Switch back to sign in mode after successful registration
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    try {
      const redirectTo = makeRedirectUri({ scheme: 'wayzle' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === 'success') {
          const url = result.url;
          // Extract tokens from the URL fragment
          const params = new URLSearchParams(url.split('#')[1]);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
    } catch (error: any) {
      if (error.message.includes('not enabled')) {
        Alert.alert('Configuration Required', `To use ${provider} login, please enable the ${provider} provider in your Supabase Dashboard under Authentication -> Providers.`);
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 py-12">
          {/* Brand */}
          <Text className="text-center text-primary text-lg font-semibold mb-2 tracking-wider">
            Wayzle
          </Text>
          <Text className="text-center text-slate-900 text-3xl font-bold mb-2">
            {isForgotPassword ? 'Reset Password' : 'Welcome to\nWayzle'}
          </Text>
          <Text className="text-center text-slate-500 text-base mb-10">
            {isForgotPassword ? 'Enter your email to receive a reset link.' : 'Sign in to continue your journey.'}
          </Text>

          {/* OAuth Buttons (Only show when not in forgot password mode) */}
          {!isForgotPassword && (
            <>
              <Pressable
                onPress={() => handleOAuthSignIn('google')}
                className="flex-row items-center justify-center bg-white border border-slate-200 rounded-xl py-4 mb-3 shadow-sm"
              >
                <Text className="text-slate-700 font-medium text-base">Continue with Google</Text>
              </Pressable>

              <Pressable
                onPress={() => handleOAuthSignIn('apple')}
                className="flex-row items-center justify-center bg-white border border-slate-200 rounded-xl py-4 mb-6 shadow-sm"
              >
                <Text className="text-slate-700 font-medium text-base">Continue with Apple</Text>
              </Pressable>

              {/* Divider */}
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-slate-200" />
                <Text className="mx-4 text-slate-400 text-sm">OR</Text>
                <View className="flex-1 h-px bg-slate-200" />
              </View>
            </>
          )}

          {/* Name Input (Sign Up only) */}
          {!isForgotPassword && isSignUp && (
            <View className="mb-4">
              <Text className="text-slate-600 text-sm font-medium mb-2">Full Name</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3.5">
                <Text className="mr-3">👤</Text>
                <TextInput
                  className="flex-1 text-slate-900 text-base outline-none"
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-slate-600 text-sm font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3.5">
              <Text className="mr-3">✉️</Text>
              <TextInput
                className="flex-1 text-slate-900 text-base outline-none"
                placeholder="suganthdz@gmail.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input (Hidden in forgot password mode) */}
          {!isForgotPassword && (
            <View className="mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-600 text-sm font-medium">Password</Text>
                {!isSignUp && (
                  <Pressable onPress={() => setIsForgotPassword(true)}>
                    <Text className="text-primary text-sm font-medium">Forgot?</Text>
                  </Pressable>
                )}
              </View>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3.5">
                <Text className="mr-3">🔒</Text>
                <TextInput
                  className="flex-1 text-slate-900 text-base outline-none"
                  placeholder="••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Text className="text-slate-400 text-lg">{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={handleEmailAuth}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center mt-6 shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </Pressable>

          {/* Toggle Auth Mode */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500 text-sm">
              {isForgotPassword 
                ? 'Remember your password? ' 
                : isSignUp 
                  ? 'Already have an account? ' 
                  : "Don't have an account? "}
            </Text>
            <Pressable onPress={() => {
              setIsSignUp(!isSignUp);
              setIsForgotPassword(false);
            }}>
              <Text className="text-primary font-bold text-sm">
                {isForgotPassword ? 'Sign In' : isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
