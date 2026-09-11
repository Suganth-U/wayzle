import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TabIconProps {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  focused: boolean;
}

function TabIcon({ name, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Feather 
        name={name} 
        size={22} 
        color={focused ? '#0f172a' : '#94a3b8'} 
      />
      <Text
        className={`text-xs mt-1 ${
          focused ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F1F5F9',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="compass" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bookmark" label="Saved" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
