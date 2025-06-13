// LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, TextInput, PasswordInput, Button, Group, Title, Text, Center, Stack } from '@mantine/core';
import { useMantineTheme } from '@mantine/core';
import { useAuth } from '../AuthContext/AuthContext'; // Импортируем useAuth

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useMantineTheme();
    const { login } = useAuth(); // Получаем функцию login из контекста

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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password),
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({})
            });

            if (response.ok) {
                const nickname = await response.text();
                login(nickname); // Используем функцию login из контекста
                navigate('/', { replace: true });
            } else {
                setError('Неверный логин или пароль');
            }
        } catch (err) {
            setError('Ошибка сети');
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
                <Stack spacing="lg">
                    <Title order={2} align="center">
                        Вход в приложение
                    </Title>
                    <Text color="dimmed" size="sm" align="center">
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
                            <Text color="red" size="sm" mt="sm" align="center">
                                {error}
                            </Text>
                        )}
                        <Group position="center" mt="lg">
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
                </Stack>
            </Card>
        </Center>
    );
};

export default LoginForm;