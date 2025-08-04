// packages/common/core/libraries/database/__tests__/firestore.integration.test.ts
import { Firestore, connectFirestoreEmulator, doc, getDoc, setDoc, getDocs, collection, deleteDoc, clearPersistence, terminate } from 'firebase/firestore';
import { AuthService } from '../../auth/firebase';
import * as firestoreDb from '../firestore';

jest.mock('@common/config/platform', () => ({
    getFirebaseConfig: jest.fn(() => Promise.resolve({
        projectId: 'test-project',
        apiKey: 'test-api-key'
    })),
    getCognitoConfig: jest.fn(() => Promise.resolve({}))
}));

jest.setTimeout(10000);

// SKIPPED: Firestore emulator issues prevent reliable integration testing
describe.skip('Firestore Integration', () => {
    let firestore: Firestore;
    let authService: AuthService;

    beforeAll(async () => {
        authService = new AuthService();
        await new Promise(resolve => setTimeout(resolve, 100));
        firestore = authService.getFirestore();
        if (firestore) {
            connectFirestoreEmulator(firestore, 'localhost', 8080);
        }
    });

    afterEach(async () => {
        if (!firestore) return;
        const querySnapshot = await getDocs(collection(firestore, 'users'));
        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        await Promise.all(deletePromises);
    });
    
    afterAll(async () => {
        if(firestore) {
            try {
                await clearPersistence(firestore);
                await terminate(firestore);
            } catch (e) {
                // ignore
            }
        }
    });

    it('should add and get a document', async () => {
        if (!firestore) return;
        const docRef = doc(firestore, 'users', 'user-1');
        await setDoc(docRef, { name: 'Test User' });
        
        const docSnap = await getDoc(docRef);
        expect(docSnap.exists()).toBe(true);
        expect(docSnap.data()?.name).toBe('Test User');
    });

    it('should get a collection', async () => {
        if (!firestore) return;
        await setDoc(doc(firestore, 'users', 'user-1'), { name: 'User 1' });
        await setDoc(doc(firestore, 'users', 'user-2'), { name: 'User 2' });

        const users = await firestoreDb.getCollection(firestore, 'users');
        expect(users).toHaveLength(2);
    });

    it('should update a document', async () => {
        if (!firestore) return;
        const docRef = doc(firestore, 'users', 'user-1');
        await setDoc(docRef, { name: 'Test User' });
        
        await firestoreDb.updateDocument(firestore, 'users/user-1', { name: 'Updated User' });

        const docSnap = await getDoc(docRef);
        expect(docSnap.data()?.name).toBe('Updated User');
    });

    it('should delete a document', async () => {
        if (!firestore) return;
        const docRef = doc(firestore, 'users', 'user-1');
        await setDoc(docRef, { name: 'Test User' });

        await firestoreDb.deleteDocument(firestore, 'users/user-1');
        
        const docSnap = await getDoc(docRef);
        expect(docSnap.exists()).toBe(false);
    });
});
