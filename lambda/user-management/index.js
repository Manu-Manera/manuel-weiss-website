const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    console.log('User Management Lambda triggered:', JSON.stringify(event, null, 2));
    
    try {
        const { httpMethod, pathParameters, body, requestContext } = event;
        const userId = requestContext.authorizer?.claims?.sub;
        
        switch (httpMethod) {
            case 'GET':
                return await handleGetUsers(event);
            case 'POST':
                return await handleCreateUser(event);
            case 'PUT':
                return await handleUpdateUser(event);
            case 'DELETE':
                return await handleDeleteUser(event);
            default:
                return {
                    statusCode: 405,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'Method not allowed'
                    })
                };
        }

    } catch (error) {
        console.error('User Management error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message: 'User Management failed',
                error: error.message
            })
        };
    }
};

async function handleGetUsers(event) {
    try {
        const { userId } = event.pathParameters || {};
        
        if (userId) {
            // Get specific user
            const result = await dynamodb.get({
                TableName: process.env.USERS_TABLE,
                Key: { userId: userId }
            }).promise();
            
            if (!result.Item) {
                return {
                    statusCode: 404,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'GET,OPTIONS'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: 'User not found'
                    })
                };
            }
            
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    user: result.Item
                })
            };
        } else {
            // Get all users
            const result = await dynamodb.scan({
                TableName: process.env.USERS_TABLE
            }).promise();
            
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    users: result.Items,
                    count: result.Count
                })
            };
        }
    } catch (error) {
        throw error;
    }
}

async function handleCreateUser(event) {
    try {
        const userData = JSON.parse(event.body);
        const userId = userData.userId || Date.now().toString();
        
        const userRecord = {
            userId: userId,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            preferences: userData.preferences || {}
        };
        
        await dynamodb.put({
            TableName: process.env.USERS_TABLE,
            Item: userRecord
        }).promise();
        
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                user: userRecord
            })
        };
    } catch (error) {
        throw error;
    }
}

async function handleUpdateUser(event) {
    try {
        const { userId } = event.pathParameters;
        const updateData = JSON.parse(event.body);
        
        const updateExpression = 'SET #firstName = :firstName, #lastName = :lastName, #role = :role, #preferences = :preferences, #updatedAt = :updatedAt';
        const expressionAttributeNames = {
            '#firstName': 'firstName',
            '#lastName': 'lastName',
            '#role': 'role',
            '#preferences': 'preferences',
            '#updatedAt': 'updatedAt'
        };
        const expressionAttributeValues = {
            ':firstName': updateData.firstName,
            ':lastName': updateData.lastName,
            ':role': updateData.role,
            ':preferences': updateData.preferences,
            ':updatedAt': new Date().toISOString()
        };
        
        await dynamodb.update({
            TableName: process.env.USERS_TABLE,
            Key: { userId: userId },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'User updated successfully'
            })
        };
    } catch (error) {
        throw error;
    }
}

async function handleDeleteUser(event) {
    try {
        const { userId } = event.pathParameters;
        
        await dynamodb.delete({
            TableName: process.env.USERS_TABLE,
            Key: { userId: userId }
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message: 'User deleted successfully'
            })
        };
    } catch (error) {
        throw error;
    }
}
