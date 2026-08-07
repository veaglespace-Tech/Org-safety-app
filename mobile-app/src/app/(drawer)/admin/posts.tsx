import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  Plus,
  Radio,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Vote,
  Calendar,
  X,
} from 'lucide-react-native';

import {
  useGetOrgPostsQuery,
  useCreatePostMutation,
  useVoteOnPostMutation,
  useDeletePostMutation,
} from '@/services/api/postApi';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { BadgePill } from '@/components/ui/BadgePill';
import { ActionModal } from '@/components/ui/ActionModal';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';

const POST_TYPES = [
  { label: 'Notification', value: 'NOTIFICATION' },
  { label: 'Poll', value: 'POLL' },
  { label: 'Article', value: 'ARTICLE' },
  { label: 'News', value: 'NEWS' },
];

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

export default function AdminPostsScreen() {
  const { user: authUser } = useSelector((state: any) => state.auth);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('NOTIFICATION');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [attachmentBase64, setAttachmentBase64] = useState('');
  const [votingId, setVotingId] = useState('');

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useGetOrgPostsQuery({ limit: 50 }, { skip: !authUser });

  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();
  const [voteOnPost] = useVoteOnPostMutation();
  const [deletePost] = useDeletePostMutation();

  const posts = useMemo(() => {
    return Array.isArray(postsData?.items)
      ? postsData.items
      : Array.isArray(postsData?.data)
      ? postsData.data
      : [];
  }, [postsData]);

  const handleAddPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (text: string, index: number) => {
    const next = [...pollOptions];
    next[index] = text;
    setPollOptions(next);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) return;
    const next = [...pollOptions];
    next.splice(index, 1);
    setPollOptions(next);
  };

  const handlePickAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed for attachments.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.base64) {
      setAttachmentBase64(`data:image/jpeg;base64,${res.assets[0].base64}`);
    }
  };

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Required', 'Please fill in title and content.');
      return;
    }

    if (postType === 'POLL') {
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        Alert.alert('Poll Error', 'Please provide at least 2 poll options.');
        return;
      }
    }

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        type: postType,
        pollOptions:
          postType === 'POLL'
            ? pollOptions.filter((o) => o.trim().length > 0).map((opt) => ({ text: opt.trim() }))
            : undefined,
        attachment: attachmentBase64 || undefined,
      };

      await createPost(payload).unwrap();
      Alert.alert('Success', 'Post published successfully.');
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setPostType('NOTIFICATION');
      setPollOptions(['', '']);
      setAttachmentBase64('');
      refetch();
    } catch (err: any) {
      Alert.alert('Publish Failed', err?.data?.message || 'Could not create post.');
    }
  };

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

  const handleDelete = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId).unwrap();
            refetch();
          } catch (e: any) {
            Alert.alert('Failed', e?.data?.message || 'Could not delete post.');
          }
        },
      },
    ]);
  };

  const renderPostContent = (post: any) => {
    const isPoll = post.type === 'POLL';
    const totalVotes = isPoll
      ? post.pollOptions?.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0) || 0
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

            <View className="flex-row items-center gap-2">
              <BadgePill
                label={post.type}
                variant={isPoll ? 'primary' : 'warning'}
                size="sm"
              />
              <TouchableOpacity
                onPress={() => handleDelete(post.id)}
                className="w-7 h-7 bg-red-50 rounded-full items-center justify-center border border-red-100 active:bg-red-100"
              >
                <Trash2 size={12} color="#dc2626" />
              </TouchableOpacity>
            </View>
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
              const voteCount = opt.votes || 0;
              const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
              const isVoting = votingId === `${post.id}-${idx}`;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleVote(post.id, idx)}
                  disabled={isVoting}
                  className="mb-2 relative h-10 justify-center rounded-xl overflow-hidden border border-slate-200 bg-white"
                >
                  {/* Progress Bar Background */}
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
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-2xl font-black text-slate-900 tracking-tight">Posts & Polls</Text>
            <Text className="text-slate-500 font-medium text-xs mt-0.5">
              Broadcast announcements to your organization
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => refetch()}
            className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
          >
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setCreateModalOpen(true)}
          className="mt-2 bg-indigo-600 rounded-xl py-3 flex-row justify-center items-center gap-2 shadow-md shadow-indigo-500/20 active:bg-indigo-700"
        >
          <Plus size={16} color="#ffffff" />
          <Text className="text-white font-extrabold text-sm">Create New Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading feed...</Text>
          </View>
        ) : posts.length === 0 ? (
          <SurfaceCard className="py-16 items-center">
            <MessageSquare size={48} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-base mt-3">No posts yet</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Create an announcement or poll to engage your members.
            </Text>
          </SurfaceCard>
        ) : (
          posts.map(renderPostContent)
        )}
      </ScrollView>

      {/* Create Post ActionModal */}
      {createModalOpen && (
        <ActionModal
          visible={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Post"
          subtitle="Publish content to your organization feed"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[600px]">
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Post Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {POST_TYPES.map((pt) => {
                  const isSelected = postType === pt.value;
                  return (
                    <TouchableOpacity
                      key={pt.value}
                      onPress={() => setPostType(pt.value)}
                      className={`px-3 py-2 rounded-xl border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {pt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TextInput
              label="Post Title"
              required
              placeholder="Enter a catchy title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              label="Content Message"
              required
              placeholder="What do you want to share?"
              value={content}
              onChangeText={setContent}
              multiline
            />

            {postType === 'POLL' && (
              <SurfaceCard variant="flat" className="p-4 mb-4 bg-slate-50 border border-slate-200">
                <Text className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-widest">
                  Poll Options
                </Text>
                {pollOptions.map((opt, idx) => (
                  <View key={idx} className="flex-row items-center gap-2 mb-2">
                    <View className="flex-1">
                      <TextInput
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChangeText={(t) => handlePollOptionChange(t, idx)}
                      />
                    </View>
                    {pollOptions.length > 2 && (
                      <TouchableOpacity
                        onPress={() => handleRemovePollOption(idx)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center -mt-4"
                      >
                        <X size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {pollOptions.length < 6 && (
                  <TouchableOpacity
                    onPress={handleAddPollOption}
                    className="flex-row items-center gap-2 py-2"
                  >
                    <Plus size={14} color="#4f46e5" />
                    <Text className="text-indigo-600 font-bold text-xs">Add Option</Text>
                  </TouchableOpacity>
                )}
              </SurfaceCard>
            )}

            <View className="mb-5">
              <Text className="text-xs font-bold text-slate-700 mb-2 ml-1">Attachment (Optional)</Text>
              <TouchableOpacity
                onPress={handlePickAttachment}
                className="bg-slate-50 border border-slate-200 border-dashed py-6 rounded-2xl items-center justify-center overflow-hidden"
              >
                {attachmentBase64 ? (
                  <Image
                    source={{ uri: attachmentBase64 }}
                    style={{ width: '100%', height: 120, position: 'absolute' }}
                    resizeMode="cover"
                  />
                ) : null}
                <View className={`items-center ${attachmentBase64 ? 'bg-black/50 p-2 rounded-xl' : ''}`}>
                  <ImageIcon size={24} color={attachmentBase64 ? '#fff' : '#94a3b8'} className="mb-2" />
                  <Text className={`text-xs font-bold ${attachmentBase64 ? 'text-white' : 'text-slate-500'}`}>
                    {attachmentBase64 ? 'Tap to change image' : 'Tap to select an image'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleCreatePost}
              isLoading={isSubmitting}
              size="lg"
              className="bg-indigo-600 rounded-2xl shadow-md shadow-indigo-500/20 mb-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-white font-extrabold text-sm">Publish to Organization</Text>
              </View>
            </Button>
          </ScrollView>
        </ActionModal>
      )}
    </View>
  );
}
