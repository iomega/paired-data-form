import React from 'react';

import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { ProtectedRoute } from './ProtectedRoute';

describe('<ProtectedRoute>', () => {
    let wrapper: RenderResult;

    describe('with anonymous user', () => {
        beforeEach(() => {
            wrapper = render(
                <ProtectedRoute>
                    <span>ProtectedContent</span>
                </ProtectedRoute>
            );
        });

        it('should render login form', () => {
            expect(wrapper.baseElement).toHaveTextContent('Username');
            expect(wrapper.baseElement).toHaveTextContent('Password');
        });
    });
});