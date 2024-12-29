import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage: string | null = null;

    constructor(private fb: FormBuilder, private http: HttpClient) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.http
                .post(
                    'http://localhost:5001/account/register',
                    this.registerForm.value
                )
                .subscribe({
                    next: (response) => {
                        alert('Registration successful!');
                        this.registerForm.reset();
                    },
                    error: (error) => {
                        if (error.status === 400) {
                            this.errorMessage =
                                'Validation failed. Please check your input.';
                        } else {
                            console.error(error);
                            this.errorMessage =
                                'Something went wrong. Please try again later.';
                        }
                    },
                });
        } else {
            this.errorMessage = 'Please correct the errors in the form.';
        }
    }
}
