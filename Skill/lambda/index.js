/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Olá, seja bem vindo a skill para ajudar você a lembrar seus medicamentos. Se tiver alguma dúvida me pergunte!';
        
        const repromptText = 'Não entendi, por favor repita.';    

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

const HasAgendadoLaunchRequestHandler = { //Has agendado, estava em baixo no codigo, no tutorial fala pra colocar ele aqui
    
    canHandle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const medicamento = sessionAttributes.hasOwnProperty('medicamento') ? sessionAttributes.medicamento : 0;
        const horas = sessionAttributes.hasOwnProperty('horas') ? sessionAttributes.horas : 0;

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'

            && medicamento

            && horas
            
    },
    handle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const medicamento = sessionAttributes.hasOwnProperty('medicamento') ? sessionAttributes.medicamento : 0;
        const horas = sessionAttributes.hasOwnProperty('horas') ? sessionAttributes.horas : 0;
        
        const speakOutput = `Bem vindo de volta, como posso ajudar?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const AgendarMedicamentoIntentHandler = { //ADICIONAR medicamentos a uma lista

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AgendarMedicamentoIntent';
    },

    async handle(handlerInput) {
        const medicamento = handlerInput.requestEnvelope.request.intent.slots.medicamento.value;
        const horas = handlerInput.requestEnvelope.request.intent.slots.horas.value;
        
        const attributesManager = handlerInput.attributesManager;
        var persistentAttributes = await attributesManager.getPersistentAttributes();
        
        const agendarAttributes = {
            "medicamento" : medicamento,
            "horas" : horas
        };
        
        if (!persistentAttributes.medicamento){
            persistentAttributes.medicamento = [];
        }
        
        persistentAttributes.medicamento.push(agendarAttributes);
        attributesManager.setPersistentAttributes(persistentAttributes);
        await attributesManager.savePersistentAttributes();
        
        const speakOutput = `O medicamento ${medicamento} foi agendado para às ${horas} horas.`;

        return handlerInput.responseBuilder

            .speak(speakOutput)
            .getResponse();
    }
};

const AlterarMedicamentoIntentHandler = { // ALTERAR um medicamento da lista

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AlterarMedicamentoIntent';
    },

    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        let persistentAttributes = await attributesManager.getPersistentAttributes();

        const intentValues = handlerInput.requestEnvelope.request.intent.slots;
        const medicamentoAlterarMed = intentValues.medicamento.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const medicamentoAlterarHor = intentValues.horas.value;

        let medicamento = persistentAttributes.medicamento;
        
        var speakOutput = "";
        
        if (!medicamento || medicamento.length === 0) {
            speakOutput = "Você não tem esse medicamento na lista."
        }
        else if (persistentAttributes.medicamento.filter(function (item) { return item.medicamento.toUpperCase() === medicamentoAlterarMed.toUpperCase() }).length === 0) {
            speakOutput = "Você não tem esse medicamento na lista."
        }
        else {
            var lista2 = persistentAttributes.medicamento;
            persistentAttributes.medicamento = [];
        
            lista2.forEach(function (item) {
                if (item.medicamento.toUpperCase() === medicamentoAlterarMed.toUpperCase()) {
                    let AlterarMed = {"medicamento" : item.medicamento, "horas" : medicamentoAlterarHor}
                    persistentAttributes.medicamento.push(AlterarMed);
                } else {
                    persistentAttributes.medicamento.push(item);
                }
            });

        speakOutput = `O medicamento ${medicamentoAlterarMed} foi alterado com sucesso.`
        }

        attributesManager.setPersistentAttributes(persistentAttributes);
        await attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder

            .speak(speakOutput)
            .getResponse();
    }
};

const ExcluirMedicamentoIntentHandler = { //EXCLUIR um medicamento da lista

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ExcluirMedicamentoIntent';
    },

    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        let persistentAttributes = await attributesManager.getPersistentAttributes();

        const intentValues = handlerInput.requestEnvelope.request.intent.slots;
        const medicamentoAremover = intentValues.medicamento.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        
        let medicamento = persistentAttributes.medicamento;
        
        var speakOutput = "";
        
        if (!medicamento || medicamento.length === 0) {
            speakOutput = "Você não tem esse medicamento na lista."
        }
        else if (persistentAttributes.medicamento.filter(function (item) { return item.medicamento.toUpperCase() === medicamentoAremover.toUpperCase() }).length === 0) {
            speakOutput = "Você não tem esse medicamento na lista."
        }
        else {
            var lista2 = persistentAttributes.medicamento;
            persistentAttributes.medicamento = [];
        
            lista2.forEach(function (item) {
                if (item.medicamento.toUpperCase() !== medicamentoAremover.toUpperCase()) {
                    persistentAttributes.medicamento.push(item);
                }
            });

        speakOutput = `O medicamento ${medicamentoAremover} foi removido com sucesso.`
        }

        attributesManager.setPersistentAttributes(persistentAttributes);
        await attributesManager.savePersistentAttributes();    

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const MostrarMedicamentoIntentHandler = {//MOSTRAR se o medicamento selecionado existe e mostra o horario que ele foi cadastrado
    
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MostrarMedicamentoIntent'
    },
    async handle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        let persistentAttributes = await attributesManager.getPersistentAttributes();

        var speakOutput = "";
        if (!persistentAttributes.medicamento) {
            speakOutput = "Nenhum medicamento cadastrado."
        }
        else if (persistentAttributes.medicamento.length === 0) {
            speakOutput = "Nenhum medicamento cadastrado."
        }
        else {
            speakOutput = "Seus medicamentos são ";
            for (var i = 0; i < persistentAttributes.medicamento.length; i++) {
                speakOutput += persistentAttributes.medicamento[i].medicamento + " ("+ persistentAttributes.medicamento[i].horas +" horas)";
                
                if (persistentAttributes.medicamento.length > 1 && i === persistentAttributes.medicamento.length - 2) {
                    speakOutput += ' e ';
                }
                else if (persistentAttributes.medicamento.length >= 3) {
                    if (i < persistentAttributes.medicamento.length - 2) {
                        speakOutput += ', ';
                    }
                }
            }
            speakOutput += '.'
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
    
};

const LoadMedicamentoIntentHandler = {//Metodo de load do tutorial
    async process(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

        const medicamento = sessionAttributes.hasOwnProperty('medicamento') ? sessionAttributes.medicamento : 0;
        const horas = sessionAttributes.hasOwnProperty('horas') ? sessionAttributes.horas : 0;

        if (medicamento && horas) {
            attributesManager.setSessionAttributes(sessionAttributes);
        }
    }
};

const AjudarAgendarIntentHandler = { // Chama o método de AJUDA caso o usuário queira saber como AGENDAR.
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AjudarAgendarIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Para cadastrar fale: "Agendar *nome do medicamento* para às *horas* horas.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AjudarAlterarIntentHandler = { // Chama o método de AJUDA caso o usuário queira saber como ALTERAR.
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AjudarAlterarIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Para alterar fale: Alterar "nome do medicamento" para as "novas horas" horas.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AjudarExcluirIntentHandler = { // Chama o método de AJUDA caso o usuário queira saber como EXCLUIR.
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AjudarExcluirIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Para excluir fale: Excluir "nome do medicamento".';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AjudarMostrarIntentHandler = { // Chama o método de AJUDA caso o usuário queira saber como MOSTRAR seus medicamentos cadastrados.
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AjudarMostrarIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Para listar seus medicamentos fale: Mostrar medicamentos.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = '';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Voce pode dizer oi para min! como eu posso ajudar?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Ate Mais!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        HasAgendadoLaunchRequestHandler,
        LaunchRequestHandler,
        AgendarMedicamentoIntentHandler,
        AlterarMedicamentoIntentHandler,
        ExcluirMedicamentoIntentHandler,
        MostrarMedicamentoIntentHandler,
        AjudarAgendarIntentHandler,
        AjudarAlterarIntentHandler,
        AjudarExcluirIntentHandler,
        AjudarMostrarIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
    )
    .addRequestInterceptors(
    LoadMedicamentoIntentHandler,
    )
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .lambda();