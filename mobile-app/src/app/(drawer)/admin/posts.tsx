import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
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
} from 'lucide-react-native';
import {
  useGetOrgPostsQuery,
  useCreatePostMutation,
  useVoteOnPostMutation,
  useDeletePostMutation,
} from '@/services/api/postApi';

const POST_TYPES = [
  { label: 'Notification', value: 'NOTIFICATION' },
  { label: 'Poll', value: 'POLL' },
  { label: 'Article', value: 'ARTICLE' },
  { label: 'News', value: 'NEWS' },
];

export default function AdminPostsScreen() {
  const { user: authUser } = useSelector((state) => state.auth);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('NOTIFICATION');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [attachmentBase64, setAttachmentBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState('');

  const {
    data: postsData,
    isLoading,
    refetch,
  } = useGetOrgPostsQuery({ limit: 50 }, { skip: !authUser });

  const [createPost] = useCreatePostMutation();
  const [voteOnPost] = useVoteOnPostMutation();
  const [deletePost] = useDeletePostMutation();

  const posts = Array.isArray(postsData?.items)
    ? postsData.items
    : Array.isArray(postsData?.data)
    ? postsData.data
    : [];

  const handleAddPollOption = () => {
    if (pollOptions.length >= 6) return;
    setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (text, index) => {
    const next = [...pollOptions];
    next[index] = text;
    setPollOptions(next);
  };

  const handlePickAttachment = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
      setSubmitting(true);
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
      await refetch();
    } catch (err) {
      Alert.alert('Publish Failed', err?.data?.message || 'Could not create post.');
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleDelete = (postId) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(postId).unwrap();
            await refetch();
          } catch (e) {
            Alert.alert('Failed', e?.data?.message || 'Could not delete post.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-black text-slate-900">Posts & Polls</Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              Announcements, news & community votes
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setCreateModalOpen(true)}
              className="p-2.5 bg-indigo-600 rounded-xl active:bg-indigo-700 flex-row items-center gap-1"
            >
              <Plus color="#ffffff" size={16} />
              <Text className="text-white font-bold text-xs">New Post</Text>
            </Pressable>
            <Pressable
              onPress={() => refetch()}
              className="p-2.5 bg-slate-100 rounded-xl active:bg-slate-200"
            >
              <RefreshCw color="#64748b" size={18} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Feed List */}
      <ScrollView className="flex-1 px-4 pt-3">
        {isLoading ? (
          <View className="py-16 items-center">
            <ActivityIndicator color="#4f46e5" size="large" />
            <Text className="text-slate-400 text-xs font-medium mt-2">Loading feed...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View className="py-16 items-center">
            <Bell color="#cbd5e1" size={40} />
            <Text className="text-slate-400 font-bold text-sm mt-2">No posts published yet</Text>
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
                {/* Author & Header */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                      <Text className="text-indigo-700 text-[10px] font-extrabold uppercase">
                        {post.type || 'NOTIFICATION'}
                      </Text>
                    </View>
                    <Text className="text-slate-400 text-xs">
                      {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleDelete(post.id)}
                    className="p-1.5 bg-rose-50 rounded-lg active:bg-rose-100"
                  >
                    <Trash2 color="#e11d48" size={14} />
                  </Pressable>
                </View>

                {/* Title & Body */}
                <Text className="text-slate-900 font-extrabold text-base mb-1.5">
                  {post.title}
                </Text>
                <Text className="text-slate-600 text-sm leading-5 mb-3">{post.content}</Text>

                {/* Attachment Image if present */}
                {post.attachment || post.attachmentUrl ? (
                  <View className="w-full h-52 rounded-2xl bg-slate-100 overflow-hidden mb-3">
                    <Image
                      source={{ uri: post.attachment || post.attachmentUrl }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                ) : null}

                {/* Interactive Poll Rendering */}
                {isPoll && (
                  <View className="bg-slate-50 p-4 rounded-2xl mt-1 space-y-2.5">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-slate-700 text-xs font-bold uppercase">
                        Poll • {totalVotes} Total Votes
                      </Text>
                    </View>

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
                          {/* Progress bar background fill */}
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

      {/* Create Post Modal */}
      <Modal visible={createModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-black text-slate-900">Create New Post</Text>
              <Pressable onPress={() => setCreateModalOpen(false)}>
                <Text className="text-slate-400 font-bold text-sm">Cancel</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Post Type Selector */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-2">Post Type</Text>
              <View className="flex-row gap-2 mb-4">
                {POST_TYPES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => setPostType(t.value)}
                    className={`flex-1 py-2 rounded-xl items-center border ${
                      postType === t.value
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        postType === t.value ? 'text-indigo-600' : 'text-slate-600'
                      }`}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Announcement / Poll title..."
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-3"
              />

              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">Content / Message</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Write your post content here..."
                multiline
                numberOfLines={3}
                className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900 font-medium mb-4 h-24"
                textAlignVertical="top"
              />

              {/* Dynamic Poll Options if Poll */}
              {postType === 'POLL' && (
                <View className="bg-slate-50 p-4 rounded-2xl mb-4">
                  <Text className="text-slate-900 font-bold text-xs uppercase mb-2">
                    Poll Options
                  </Text>
                  {pollOptions.map((opt, idx) => (
                    <TextInput
                      key={idx}
                      value={opt}
                      onChangeText={(t) => handlePollOptionChange(t, idx)}
                      placeholder={`Option ${idx + 1}...`}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium mb-2 text-xs"
                    />
                  ))}
                  {pollOptions.length < 6 && (
                    <Pressable
                      onPress={handleAddPollOption}
                      className="py-2 items-center bg-indigo-50 rounded-xl mt-1"
                    >
                      <Text className="text-indigo-600 font-bold text-xs">+ Add Another Option</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Attachment Picker */}
              <Text className="text-slate-700 text-xs font-bold uppercase mb-1">
                Image Attachment (Optional)
              </Text>
              <Pressable
                onPress={handlePickAttachment}
                className="bg-slate-100 border border-dashed border-slate-300 rounded-xl p-4 items-center justify-center mb-6"
              >
                {attachmentBase64 ? (
                  <View className="items-center">
                    <CheckCircle2 color="#059669" size={24} />
                    <Text className="text-emerald-700 font-bold text-xs mt-1">Image Attached</Text>
                  </View>
                ) : (
                  <View className="items-center">
                    <ImageIcon color="#94a3b8" size={24} />
                    <Text className="text-slate-500 font-bold text-xs mt-1">
                      Tap to select image
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={handleCreatePost}
                disabled={submitting}
                className="bg-indigo-600 py-4 rounded-2xl items-center justify-center active:bg-indigo-700 mb-6"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-extrabold text-base">Publish Post</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
