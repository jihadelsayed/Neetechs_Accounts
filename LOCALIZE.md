1. add it to the angular app 
  ```
    ng add @angular/localize
  ```
2. Adjust the content for localization

  ```
    <div>
    <p i18n="Simple message example@@message.simple">A simple message.</p>

    <p i18n="Argument message example@@message.argument">Hi, {{ name }}! 👋</p>

    <p i18n="Plural message example@@message.plural">{count, plural, one {{{count}} item} other {{{count}} items}}</p>

    <p i18n="Gender message example@@message.gender">{gender, select, male {Mr {{ name }}} female {Mrs {{ name }}} other {Client {{ name }}}}</p>

    <p i18n="Formatted number message example@@message.number-format">Formatted number: {{ amount | number: ".2" }}</p>

    <p i18n="Formatted date message example@@message.date-format">Formatted date: {{ currentDate | date: "fullDate" }}</p>

    <div>
      <ng-container>{{ footerMessage }}</ng-container>
    </div>
  </div>
  ```
  The app.component.ts file:
  ```
    export class AppComponent {
      name: string = 'John';
      count: number = 5;
      gender: string = 'male';
      amount: number = 7.5;
      currentDate: number = Date.now();

      company: string = 'Localizely';
      footerMessage: string = $localize`:Component argument message example@@message.component-argument:Made with ❤️ by ${this.company}`;
    }
  ```
3. Extract marked content for localization
  ```
    ng extract-i18n --output-path src/locale
    // output will be messages.xlf
  ```

4. Translate XLIFF files
rename it to messages.fr.xlf


5. Merge translations into the app
  ```

{ 
  ... 
  "projects": { 
    "angular-i18n-example": { 
      ... 
      "i18n": { 
        "sourceLocale": "en-US", 
        "locales": { 
          "fr": "src/locale/messages.fr.xlf" 
        } 
      }, 
      "architect": { 
        "build": { 
          ... 
          "options": { 
            "localize": true, 
            "aot": true 
          }, 
          "configurations": { 
            ... 
            "en-US": { 
              "localize": ["en-US"] 
            }, 
            "fr": { 
              "localize": ["fr"] 
            } 
          }, 
          ... 
        }, 
        "serve": { 
          ... 
          "configurations": { 
            ... 
            "en-US": { 
              "browserTarget": "angular-i18n-example:build:en-US" 
            }, 
            "fr": { 
              "browserTarget": "angular-i18n-example:build:fr" 
            } 
          }, 
          ... 
        }, 
        ... 
      } 
      ... 
    } 
    ... 
  } 
  ... 
}
  ```

To build use:
```
  ng build --configuration
```

To deploy:
```
firebase deploy
```
