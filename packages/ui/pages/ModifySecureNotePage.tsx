import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { updateItemInDatabase } from '@common/core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useAuthStore } from '@common/core/states/auth.state';
import ItemSecureNote from '@ui/components/ItemSecureNote';

interface ModifySecureNotePageProps {
  secureNote: SecureNoteDecrypted;
  onBack: () => void;
}

export const ModifySecureNotePage: React.FC<ModifySecureNotePageProps> = ({
  secureNote,
  onBack,
}) => {
  const [title, setTitle] = useState(secureNote.title);
  const [content, setContent] = useState(secureNote.note);
  const [notes, setNotes] = useState(secureNote.note || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewNote, setPreviewNote] = useState<SecureNoteDecrypted>(secureNote);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const updatedNote: SecureNoteDecrypted = {
      ...secureNote,
      title,
      note: content,
      lastUseDateTime: secureNote.lastUseDateTime, // Keep existing lastUseDateTime
    };
    setPreviewNote(updatedNote);
  }, [title, content, secureNote]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }

      const updates: Partial<SecureNoteDecrypted> = {
        title: title.trim(),
        note: content.trim(),
        lastUseDateTime: new Date(),
      };

      await updateItemInDatabase(user.id, secureNote.id, userSecretKey, updates as any);
      Alert.alert('Success', 'Secure note updated successfully');
      onBack();
    } catch (error) {
      console.error('Failed to update secure note:', error);
      Alert.alert('Error', 'Failed to update secure note');
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
        <Text style={styles.title}>Modify Secure Note</Text>
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
            placeholder="Enter note title"
          />

          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="Enter note content"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
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
          <ItemSecureNote note={previewNote} />
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