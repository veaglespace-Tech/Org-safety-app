import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  Bell,
  Radio,
  CheckCircle2,
  RefreshCw,
  Vote,
} from 'lucide-react-native';
import {
  useGetOrgPostsQuery,
  useVoteOnPostMutation,
} from '@/services/api/postApi';

export default function MemberPostsScreen() {
  const { user: authUser } = useSelector((state) => state.auth);
  const [votingId, setVotingId] = useState('');

  const {
    data: postsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrgPostsQuery({ limit: 50 }, { skip: !authUser });

  const [voteOnPost] = useVoteOnPostMutation();

  const posts = Array.isArray(postsData?.items)
    ? postsData.items
    : Array.isArray(postsData?.data)
    ? postsData.data
    : [];

  const handleVote = async (postId, optionIndex) => {
    try {
      setVotingId(`${postId}-${optionIndex}`);
      await voteOnPost({ id: postId, optionIndex }).unwrap();
      await refetch();
    } catch (err) {
      Alert.alert('Vote Failed', err?.data?.message || 'Could not register your vote.');
    } finally {
      setVotingId('');
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-black text-slate-900">Announcements & Polls</Text>
          <Text className="text-slate-500 text-xs mt-0.5">Stay updated with organization news</Text>
        </View>
        <Pressable
          onPress={() => refetch()}
          className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
        >
          <RefreshCw color="#64748b" size={18} />
        </Pressable>
      </View>

      {/* Posts Feed */}
      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading announcements...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View className="py-16 items-center">
            <Bell color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No announcements available</Text>
          </View>
        ) : (
          posts.map((post) => {
            const isPoll = post.type === 'POLL' || Array.isArray(post.pollOptions);
            const totalVotes = isPoll
              ? (post.pollOptions || []).reduce((sum, opt) => sum + (opt.votesCount || opt.votes || 0), 0)
              : 0;

            return (
              <View
                key={post.id}
                className="bg-white rounded-3xl p-5 mb-4 border border-slate-100 shadow-xs"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                    <Text className="text-indigo-700 text-[10px] font-extrabold uppercase">
                      {post.type || 'NOTIFICATION'}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-xs">
                    {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>

                <Text className="text-slate-900 font-extrabold text-base mb-1.5">{post.title}</Text>
                <Text className="text-slate-600 text-sm leading-5 mb-3">{post.content}</Text>

                {post.attachment || post.attachmentUrl ? (
                  <View className="w-full h-52 rounded-2xl bg-slate-100 overflow-hidden mb-3">
                    <Image
                      source={{ uri: post.attachment || post.attachmentUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                {/* Poll Options */}
                {isPoll && (
                  <View className="bg-slate-50 p-4 rounded-2xl mt-1 space-y-2.5">
                    <Text className="text-slate-700 text-xs font-bold uppercase mb-1">
                      Poll • {totalVotes} Total Votes
                    </Text>

                    {(post.pollOptions || []).map((option, idx) => {
                      const votes = option.votesCount || option.votes || 0;
                      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                      const isVoted = option.userVoted || option.hasVoted;

                      return (
                        <Pressable
                          key={idx}
                          onPress={() => handleVote(post.id, idx)}
                          disabled={votingId !== ''}
                          className="relative bg-white border border-slate-200 rounded-xl p-3 overflow-hidden active:bg-slate-100"
                        >
                          <View
                            className="absolute top-0 bottom-0 left-0 bg-indigo-50"
                            style={{ width: `${percentage}%` }}
                          />

                          <View className="flex-row items-center justify-between relative z-10">
                            <View className="flex-row items-center gap-2 flex-1 mr-2">
                              <View
                                className={`w-4 h-4 rounded-full border items-center justify-center ${
                                  isVoted
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isVoted && <CheckCircle2 color="#fff" size={10} />}
                              </View>
                              <Text
                                className={`text-xs font-semibold ${
                                  isVoted ? 'text-indigo-900 font-bold' : 'text-slate-800'
                                }`}
                              >
                                {option.text}
                              </Text>
                            </View>

                            <Text className="text-slate-500 font-bold text-xs">
                              {percentage}% ({votes})
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
