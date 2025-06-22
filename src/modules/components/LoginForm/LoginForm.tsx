import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, TextInput, PasswordInput, Button, Group, Title, Text, Center, Stack } from '@mantine/core';
import { useMantineTheme } from '@mantine/core';
import { useAuth } from '../AuthContext/AuthContext';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !password) {
            setError('Пожалуйста, заполните все поля');
            setIsLoading(false);
            return;
        }

        try {
            await login(username, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError('Неверный логин или пароль');
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
                        Вход в приложение
                    </Title>
                    <Text color="dimmed" size="sm" ta="center">
                        Введите ваши данные для входа
                    </Text>
                    <form onSubmit={handleSubmit}>
                        <TextInput
                            label="Логин"
                            placeholder="Ваш логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            size="md"
                            mt="sm"
                        />
                        <PasswordInput
                            label="Пароль"
                            placeholder="Ваш пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                Войти
                            </Button>
                        </Group>
                    </form>
                    <Group justify="center">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => navigate('/register')}
                        >
                            Зарегистрироваться
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Center>
    );
};

export default LoginForm;