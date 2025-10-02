import React, { useState } from 'react';
import {
  Page,
  Header,
  Content,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import SmartToyIcon from '@material-ui/icons/SmartToy';
import PersonIcon from '@material-ui/icons/Person';
import ArchitectureIcon from '@material-ui/icons/Architecture';

const useStyles = makeStyles(theme => ({
  chatContainer: {
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  inputContainer: {
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  messageUser: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
  },
  messageBot: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-start',
  },
  messagePaper: {
    padding: theme.spacing(1, 2),
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  botMessage: {
    backgroundColor: theme.palette.grey[100],
  },
  avatar: {
    margin: theme.spacing(0, 1),
  },
  quickActions: {
    marginBottom: theme.spacing(2),
  },
  quickActionChip: {
    margin: theme.spacing(0.5),
  },
}));

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ArchitectureChatbotPage = () => {
  const classes = useStyles();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de arquitectura. Puedo ayudarte con:\n\n• Diseño de APIs\n• Patrones arquitectónicos\n• Mejores prácticas\n• Documentación técnica\n• Implementación de microservicios\n\n¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    'Cómo implementar una API REST',
    'Patrones de microservicios',
    'Arquitectura cloud-native',
    'Mejores prácticas DevOps',
    'Seguridad en APIs',
    'Monitoreo y observabilidad',
  ];

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call API backend
      const response = await fetch('/api/architecture-chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          context: 'demojam-architecture',
        }),
      });

      const data = await response.json();

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Lo siento, no pude procesar tu consulta en este momento.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getFallbackResponse(messageText),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('api')) {
      return '📚 Para implementar una API:\n\n1. **Diseño**: Define endpoints RESTful\n2. **Documentación**: Usa OpenAPI/Swagger\n3. **Autenticación**: OAuth 2.0 + JWT\n4. **Versionado**: Semver en headers\n5. **Testing**: Pruebas unitarias e integración\n\n¿Te gustaría más detalles sobre algún punto específico?';
    }
    
    if (lowerMessage.includes('microservicio')) {
      return '🏗️ Patrones de microservicios:\n\n• **API Gateway**: Punto único de entrada\n• **Service Mesh**: Comunicación segura\n• **CQRS**: Separación de comandos/consultas\n• **Event Sourcing**: Estado basado en eventos\n• **Circuit Breaker**: Tolerancia a fallos\n\n¿Qué patrón específico te interesa?';
    }
    
    if (lowerMessage.includes('arquitectura')) {
      return '🔧 Arquitectura cloud-native:\n\n• **Containers**: Docker + Kubernetes\n• **12-Factor Apps**: Metodología\n• **GitOps**: Infraestructura como código\n• **Observabilidad**: Métricas + logs + traces\n• **CI/CD**: Pipelines automatizados\n\n¿Sobre qué componente quieres saber más?';
    }
    
    return '🤔 Pregunta interesante. Puedes consultar sobre:\n\n• Diseño de APIs\n• Patrones arquitectónicos\n• Mejores prácticas DevOps\n• Seguridad\n• Monitoreo\n\n¿Podrías ser más específico?';
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Page themeId="tool">
      <Header
        title="Asistente de Arquitectura"
        subtitle="Consulta sobre documentación arquitectónica, APIs y mejores prácticas"
      >
        <ArchitectureIcon />
      </Header>
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <InfoCard title="Chat con el Asistente">
              <Box className={classes.chatContainer}>
                {/* Quick Actions */}
                <Box className={classes.quickActions}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Consultas rápidas:
                  </Typography>
                  {quickActions.map((action, index) => (
                    <Chip
                      key={index}
                      label={action}
                      onClick={() => handleSendMessage(action)}
                      className={classes.quickActionChip}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                {/* Messages */}
                <Box className={classes.messagesContainer}>
                  <List>
                    {messages.map((message) => (
                      <ListItem
                        key={message.id}
                        className={
                          message.sender === 'user'
                            ? classes.messageUser
                            : classes.messageBot
                        }
                      >
                        <Box display="flex" alignItems="flex-start">
                          {message.sender === 'bot' && (
                            <Avatar className={classes.avatar}>
                              <SmartToyIcon />
                            </Avatar>
                          )}
                          <Paper
                            className={`${classes.messagePaper} ${
                              message.sender === 'user'
                                ? classes.userMessage
                                : classes.botMessage
                            }`}
                          >
                            <Typography
                              variant="body2"
                              style={{ whiteSpace: 'pre-wrap' }}
                            >
                              {message.text}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Paper>
                          {message.sender === 'user' && (
                            <Avatar className={classes.avatar}>
                              <PersonIcon />
                            </Avatar>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                    {isLoading && (
                      <ListItem className={classes.messageBot}>
                        <Box display="flex" alignItems="center">
                          <Avatar className={classes.avatar}>
                            <SmartToyIcon />
                          </Avatar>
                          <Progress />
                          <Typography variant="body2" style={{ marginLeft: 8 }}>
                            Pensando...
                          </Typography>
                        </Box>
                      </ListItem>
                    )}
                  </List>
                </Box>

                {/* Input */}
                <Box className={classes.inputContainer}>
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      placeholder="Pregunta sobre arquitectura, APIs, patrones..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      variant="outlined"
                      size="small"
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isLoading}
                      endIcon={<SendIcon />}
                    >
                      Enviar
                    </Button>
                  </Box>
                </Box>
              </Box>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard title="Temas Disponibles">
              <List>
                <ListItemText
                  primary="🏗️ Arquitectura"
                  secondary="Patrones arquitectónicos, microservicios, cloud-native"
                />
                <ListItemText
                  primary="🔌 APIs"
                  secondary="REST, GraphQL, gRPC, documentación OpenAPI"
                />
                <ListItemText
                  primary="🔒 Seguridad"
                  secondary="OAuth, JWT, RBAC, security best practices"
                />
                <ListItemText
                  primary="📊 Observabilidad"
                  secondary="Métricas, logs, traces, monitoring"
                />
                <ListItemText
                  primary="🚀 DevOps"
                  secondary="CI/CD, GitOps, containers, Kubernetes"
                />
                <ListItemText
                  primary="💾 Datos"
                  secondary="Bases de datos, persistencia, backup"
                />
              </List>
            </InfoCard>

            <InfoCard title="Documentación" style={{ marginTop: 16 }}>
              <Typography variant="body2">
                Este chatbot puede ayudarte con:
              </Typography>
              <List dense>
                <ListItemText primary="• Consultas arquitectónicas" />
                <ListItemText primary="• Guías de implementación" />
                <ListItemText primary="• Mejores prácticas" />
                <ListItemText primary="• Ejemplos de código" />
                <ListItemText primary="• Troubleshooting" />
              </List>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};