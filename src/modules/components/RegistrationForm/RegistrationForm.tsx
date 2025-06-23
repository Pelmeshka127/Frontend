import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, TextInput, PasswordInput, Button, Group, Title, Text, Center, Stack } from '@mantine/core';
import { useMantineTheme } from '@mantine/core';
import { useAuth } from '../AuthContext/AuthContext';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        nickname: '',
        firstname: '',
        secondname: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { register } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.nickname || !formData.firstname || !formData.dateOfBirth || !formData.phone || !formData.password) {
            setError('Пожалуйста, заполните все обязательные поля');
            setIsLoading(false);
            return;
        }

        try {
            await register(formData);
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Center style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[0] }}>
            <Card
                shadow="md"
                padding="xl"
                radius="md"
                withBorder
                style={{ width: '100%', maxWidth: 400 }}
            >
                <Stack gap="lg">
                    <Title order={2} ta="center">
                        Регистрация
                    </Title>
                    <Text color="dimmed" size="sm" ta="center">
                        Заполните форму для создания аккаунта
                    </Text>
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="Логин"
                            placeholder="Ваш логин"
                            value={formData.nickname}
                            onChange={(e) => handleChange('nickname', e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        <TextInput
                            label="Имя"
                            placeholder="Ваше имя"
                            value={formData.firstname}
                            onChange={(e) => handleChange('firstname', e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        <TextInput
                            label="Фамилия"
                            placeholder="Ваша фамилия"
                            value={formData.secondname}
                            onChange={(e) => handleChange('secondname', e.target.value)}
                            size="md"
                            mt="sm"
                        />
                        <TextInput
                            label="Дата рождения"
                            placeholder="yyyy-MM-dd"
                            value={formData.dateOfBirth}
                            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        <TextInput
                            label="Телефон"
                            placeholder="+79991234567"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        <TextInput
                            label="Email"
                            placeholder="Ваш email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            size="md"
                            mt="sm"
                        />
                        <PasswordInput
                            label="Пароль"
                            placeholder="Ваш пароль"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        {error && (
                            <Text color="red" size="sm" mt="sm" ta="center">
                                {error}
                            </Text>
                        )}
                        <Group justify="center" mt="lg">
                            <Button
                                type="submit"
                                size="md"
                                fullWidth
                                disabled={isLoading}
                                loading={isLoading}
                                loaderProps={{ size: 'sm' }}
                            >
                                Зарегистрироваться
                            </Button>
                        </Group>
                    </form>
                </Stack>
            </Card>
        </Center>
    );
};

export default RegisterForm;