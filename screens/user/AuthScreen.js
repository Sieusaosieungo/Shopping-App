import React, { useReducer, useCallback, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Button,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';
import * as authActions from '../../store/actions/auth';
import { useDispatch } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }

  return state;
};

const AuthScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      email: '',
      password: '',
    },
    inputValidities: {
      email: false,
      password: false,
    },
    formIsValid: false,
  });

  useEffect(() => {
    props.navigation.setParams({ isSignup });
  }, [isSignup]);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi xảy ra!', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  const authHandler = async () => {
    let action;

    if (isSignup) {
      action = authActions.signup(
        formState.inputValues.email,
        formState.inputValues.password
      );
    } else {
      action = authActions.login(
        formState.inputValues.email,
        formState.inputValues.password
      );
    }
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(action);
      props.navigation.navigate('Shop');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  return (
    <KeyboardAvoidingView
      behavior='padding'
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
      style={styles.screen}
    >
      <LinearGradient colors={['#ffedff', '#ffe3ff']} style={styles.gradient}>
        <View style={styles.gradient}>
          <Card style={styles.authContainer}>
            <ScrollView>
              <Input
                id='email'
                label='Email'
                keyboardType='email-address'
                required
                email
                autoCapitalize='none'
                errorText='Địa chỉ email không hợp lệ.'
                onInputChange={inputChangeHandler}
                initialValue=''
              />
              <Input
                id='password'
                label='Mật khẩu'
                keyboardType='default'
                secureTextEntry
                required
                minLength={5}
                autoCapitalize='none'
                errorText='Mật khẩu không hợp lệ.'
                onInputChange={inputChangeHandler}
                initialValue=''
              />
              {isSignup && (
                <Input
                  id='name'
                  label='Tên'
                  keyboardType='default'
                  required
                  // minLength={5}
                  autoCapitalize='none'
                  errorText='Tên không hợp lệ.'
                  onInputChange={inputChangeHandler}
                  initialValue=''
                />
              )}
              {isSignup && (
                <Input
                  id='phone'
                  label='Số điện thoại'
                  keyboardType='default'
                  required
                  minLength={9}
                  autoCapitalize='none'
                  errorText='Số điện thoại không hợp lệ.'
                  onInputChange={inputChangeHandler}
                  initialValue=''
                />
              )}
              <View style={styles.buttonContainer}>
                {isLoading ? (
                  <ActivityIndicator size='large' color={Colors.primary} />
                ) : (
                  <Button
                    title={isSignup ? 'Đăng ký' : 'Đăng nhập'}
                    color={Colors.primary}
                    onPress={authHandler}
                  />
                )}
              </View>

              <View style={styles.buttonContainer}>
                {/* <Button
                  title={
                    isSignup ? 'Tôi đã có tài khoản' : 'Tôi chưa có tài khoản'
                  }
                  color={Colors.accent}
                  onPress={() => {
                    setIsSignup((prevState) => !prevState);
                  }}
                /> */}
                <TouchableOpacity
                  style={{ alignItems: 'flex-end' }}
                  onPress={() => {
                    setIsSignup((prevState) => !prevState);
                  }}
                >
                  <Text
                    style={{
                      textDecorationLine: 'underline',
                      color: Colors.accent,
                    }}
                  >
                    {isSignup ? 'Tôi đã có tài khoản' : 'Tôi chưa có tài khoản'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Card>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

AuthScreen.navigationOptions = (navData) => {
  const isSignup = navData.navigation.getParam('isSignup');
  return {
    headerTitle: isSignup ? 'Đăng ký' : 'Đăng nhập',
  };
};

export default AuthScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    maxHeight: 500,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
