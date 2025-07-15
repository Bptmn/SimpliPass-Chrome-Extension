import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { updateItemInDatabase } from '@common/core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useAuthStore } from '@common/core/states/auth.state';
import { CredentialCard } from '@ui/components/CredentialCard';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({
  credential,
  onBack,
}) => {
  const [title, setTitle] = useState(credential.title);
  const [username, setUsername] = useState(credential.username);
  const [password, setPassword] = useState(credential.password);
  const [url, setUrl] = useState(credential.url);
  const [notes, setNotes] = useState(credential.note || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewCredential, setPreviewCredential] = useState<CredentialDecrypted>(credential);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const updatedCredential: CredentialDecrypted = {
      ...credential,
      title,
      username,
      password,
      url,
      note: notes || '',
    };
    setPreviewCredential(updatedCredential);
  }, [title, username, password, url, notes, credential]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!title.trim() || !username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }

      const updates: Partial<CredentialDecrypted> = {
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        note: notes.trim(),
        lastUseDateTime: new Date(),
      };

      await updateItemInDatabase(user.id, credential.id, userSecretKey, updates as any);
      Alert.alert('Success', 'Credential updated successfully');
      onBack();
    } catch (error) {
      console.error('Failed to update credential:', error);
      Alert.alert('Error', 'Failed to update credential');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modify Credential</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter credential title"
          />

          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />

          <Text style={styles.label}>URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="Enter URL"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview</Text>
          <CredentialCard credential={previewCredential} onPress={() => {}} />
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  preview: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 