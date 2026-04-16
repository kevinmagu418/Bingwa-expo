import { Redirect } from "expo-router";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#25D366" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/scan" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}
