import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Bell,
  RefreshCw,
  MessageSquare,
  Vote,
} from 'lucide-react-native';

import {
  useGetOrgPostsQuery,
  useVoteOnPostMutation,
} from '@/services/api/postApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';

const formatDateTime = (value: any) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function MemberPostsScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);
  const [votingId, setVotingId] = useState('');

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useGetOrgPostsQuery({ limit: 50 }, { skip: !authUser });

  const [voteOnPost] = useVoteOnPostMutation();

  const posts = useMemo(() => {
    return Array.isArray(postsData?.items)
      ? postsData.items
      : Array.isArray(postsData?.data)
      ? postsData.data
      : [];
  }, [postsData]);

  const handleVote = async (postId: string, optionIndex: number) => {
    try {
      setVotingId(`${postId}-${optionIndex}`);
      await voteOnPost({ id: postId, optionIndex }).unwrap();
      refetch();
    } catch (err: any) {
      Alert.alert('Vote Failed', err?.data?.message || 'Could not register your vote.');
    } finally {
      setVotingId('');
    }
  };

  const renderPostContent = (post: any) => {
    const isPoll = post.type === 'POLL';
    const totalVotes = isPoll
      ? post.pollOptions?.reduce((acc: number, opt: any) => acc + (opt.votes || opt.votesCount || 0), 0) || 0
      : 0;

    return (
      <SurfaceCard key={post.id} className="mb-4 overflow-hidden border border-slate-200">
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isPoll ? 'bg-indigo-50 border border-indigo-100' : 'bg-rose-50 border border-rose-100'
                }`}
              >
                {isPoll ? (
                  <Vote size={14} color="#4f46e5" />
                ) : (
                  <Bell size={14} color="#e11d48" />
                )}
              </View>
              <View>
                <Text className="text-xs font-black text-slate-800">
                  {post.authorName || 'Admin'}
                </Text>
                <Text className="text-[10px] font-bold text-slate-400">
                  {formatDateTime(post.createdAt)}
                </Text>
              </View>
            </View>

            <BadgePill
              label={post.type}
              variant={isPoll ? 'primary' : 'warning'}
              size="sm"
            />
          </View>

          <Text className="text-lg font-black text-slate-900 mb-1">{post.title}</Text>
          <Text className="text-sm font-medium text-slate-600 leading-5">{post.content}</Text>
        </View>

        {post.attachment && (
          <Image
            source={{ uri: post.attachment }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        )}

        {isPoll && post.pollOptions && (
          <View className="bg-slate-50 border-t border-slate-100 p-4">
            <Text className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
              Live Poll ({totalVotes} votes)
            </Text>
            {post.pollOptions.map((opt: any, idx: number) => {
              const voteCount = opt.votes || opt.votesCount || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isVoting = votingId === `${post.id}-${idx}`;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleVote(post.id, idx)}
                  disabled={isVoting}
                  className="mb-2 relative h-10 justify-center rounded-xl overflow-hidden border border-slate-200 bg-white active:bg-slate-50"
                >
                  <View
                    className="absolute left-0 top-0 bottom-0 bg-indigo-100"
                    style={{ width: `${percentage}%` }}
                  />
                  <View className="flex-row items-center justify-between px-3 relative z-10">
                    <Text className="font-bold text-slate-800 text-sm">
                      {opt.text}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {isVoting && <ActivityIndicator size="small" color="#4f46e5" />}
                      <Text className="font-bold text-indigo-700 text-xs">
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </SurfaceCard>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-200 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Announcements</Text>
            <Text className="text-slate-500 font-medium text-xs mt-0.5">
              Organization news & community polls
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading announcements...</Text>
          </View>
        ) : posts.length === 0 ? (
          <SurfaceCard className="py-16 items-center">
            <MessageSquare size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">No announcements yet</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Any new broadcasts will appear here.
            </Text>
          </SurfaceCard>
        ) : (
          posts.map(renderPostContent)
        )}
      </ScrollView>
    </View>
  );
}
