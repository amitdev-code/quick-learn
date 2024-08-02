'use client';
import FormFieldsMapper from '../../shared/formElements/FormFieldsMapper';
import { FieldConfig } from '../..//shared/types/formTypes';

import React from 'react';
import { loginFormSchema } from './loginFormSchema';
import Link from 'next/link';
import { z } from 'zod';
import { RouteEnum } from '../../constants/route.enum';

const Login = () => {
  const loginFields: FieldConfig[] = [
    {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'name@company.com',
    },
    {
      label: 'Password',
      name: 'password',
      type: 'password',
      placeholder: '••••••••',
    },
    { label: 'Remember me', name: 'rememberMe', type: 'checkbox' },
  ];
  type LoginFormData = z.infer<typeof loginFormSchema>;

  const handleLogin = async (data: LoginFormData) => {
    console.log('Login data:', data);
  };

  return (
    <>
      <FormFieldsMapper
        fields={loginFields}
        schema={loginFormSchema}
        onSubmit={handleLogin}
        buttonText="Sign In"
      />
      <Link
        href={RouteEnum.FORGOT_PASSWORD}
        className="block text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
      >
        Forgot password?
      </Link>
    </>
  );
};

export default Login;