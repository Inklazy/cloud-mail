import { expect, test } from 'vitest';
import aiService from '../src/service/ai-service';

test('uses the supported default model for verification code extraction', async () => {
	let requestedModel = '';
	const c = {
		env: {
			ai: {
				async run(model) {
					requestedModel = model;
					return { response: '{"code":"6277"}' };
				}
			}
		}
	};
	const email = {
		subject: 'Netflix：您的登录代码',
		text: '输入此代码登录\n6277',
		from: { address: 'info@account.netflix.com' }
	};

	const code = await aiService.extractCode(c, email, {
		aiCode: 0,
		aiCodeFilter: 'account.netflix.com'
	});

	expect(requestedModel).toBe('@cf/meta/llama-3.2-3b-instruct');
	expect(code).toBe('6277');
});

test('accepts a structured response from Workers AI', async () => {
	const c = {
		env: {
			ai: {
				async run() {
					return { response: { code: '6277' } };
				}
			}
		}
	};
	const email = {
		subject: 'Netflix：您的登录代码',
		text: '输入此代码登录\n6277',
		from: { address: 'info@account.netflix.com' }
	};

	const code = await aiService.extractCode(c, email, {
		aiCode: 0,
		aiCodeFilter: 'account.netflix.com'
	});

	expect(code).toBe('6277');
});

test('converts a numeric verification code to text', async () => {
	const c = {
		env: {
			ai: {
				async run() {
					return { response: { code: 2223 } };
				}
			}
		}
	};
	const email = {
		subject: 'Netflix：您的登录代码',
		text: '输入此代码登录\n2223',
		from: { address: 'info@account.netflix.com' }
	};

	const code = await aiService.extractCode(c, email, {
		aiCode: 0,
		aiCodeFilter: 'account.netflix.com'
	});

	expect(code).toBe('2223');
});
