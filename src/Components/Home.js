import React, {useState, useEffect} from 'react';

import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore'; 
const Home = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true); 
    try {
      const snapshot = await firestore()
        .collection('users')
        .where('approved', '==', false)
        .get();

      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingUsers(usersList);
    } catch (error) {
      console.error('Error fetching pending users: ', error);
      Alert.alert('Error', 'Failed to fetch pending users');
    } finally {
      setLoading(false); 
    }
  };

  const updateUserStatus = async (userId, isApproved) => {
    try {
      await firestore().collection('users').doc(userId).update({
        approved: isApproved,
      });

      Alert.alert(isApproved ? 'User approved!' : 'User declined.');

      fetchPendingUsers();
    } catch (error) {
      console.error('Error updating user status: ', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>
        Pending Users
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View
              style={{
                marginBottom: 15,
                padding: 15,
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <Text style={{fontSize: 18}}>Name: {item.name}</Text>
              <Text>Email: {item.email}</Text>
              <View style={{flexDirection: 'row', marginTop: 10, paddingHorizontal:10, justifyContent:'space-between'}}>
                <Button
                  title="Approve"
                  onPress={() => updateUserStatus(item.id, true)}
                  color="#013220" 
                />
                <Button
                  title="Decline"
                  onPress={() => updateUserStatus(item.id, false)}
                  color="red"
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Home;
