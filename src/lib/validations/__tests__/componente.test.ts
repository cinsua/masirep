import {
  componenteCreateSchema,
  componenteUpdateSchema,
  validateComponente,
  validateComponenteByCategory,
  categoryValidationRules
} from '../componente';

describe('Componente Validation Schemas', () => {
  describe('componenteCreateSchema', () => {
    const validComponente = {
      categoria: 'RESISTENCIA',
      descripcion: 'Resistencia de 1K ohm',
      valorUnidad: [{ valor: '1K', unidad: 'Ω' }],
      stockMinimo: 10,
    };

    it('validates a correct componente', () => {
      const result = componenteCreateSchema.safeParse(validComponente);
      expect(result.success).toBe(true);
    });

    it('requires categoria', () => {
      const invalidComponente = { ...validComponente, categoria: undefined };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required');
      }
    });

    it('validates categoria enum values', () => {
      const invalidCategorias = ['INVALID', 'resistencia', 'CAPACITOR', 'INTEGRADO', 'VENTILADOR', 'OTROS'];
      invalidCategorias.forEach(categoria => {
        const componente = { ...validComponente, categoria };
        const result = componenteCreateSchema.safeParse(componente);
        if (categoria !== 'CAPACITOR' && categoria !== 'INTEGRADO' && categoria !== 'VENTILADOR' && categoria !== 'OTROS') {
          expect(result.success).toBe(false);
        }
      });
    });

    it('requires descripcion', () => {
      const invalidComponente = { ...validComponente, descripcion: '' };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La descripción es requerida');
      }
    });

    it('validates descripcion length', () => {
      const invalidComponente = {
        ...validComponente,
        descripcion: 'a'.repeat(501) // 501 characters
      };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La descripción no puede exceder 500 caracteres');
      }
    });

    it('requires at least one valor/unidad pair', () => {
      const invalidComponente = { ...validComponente, valorUnidad: [] };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Se requiere al menos un par valor/unidad completo');
      }
    });

    it('validates valor/unidad pair structure', () => {
      const invalidPairs = [
        { valor: '', unidad: 'Ω' }, // Empty valor
        { valor: '1K', unidad: '' }, // Empty unidad
        { valor: '', unidad: '' }, // Both empty
      ];

      invalidPairs.forEach((pair, index) => {
        const componente = { ...validComponente, valorUnidad: [pair] };
        const result = componenteCreateSchema.safeParse(componente);
        expect(result.success).toBe(false);
      });
    });

    it('requires at least one complete valor/unidad pair', () => {
      const invalidComponente = {
        ...validComponente,
        valorUnidad: [
          { valor: '', unidad: '' },
          { valor: '  ', unidad: 'Ω' }, // Whitespace valor
          { valor: '1K', unidad: '  ' }, // Whitespace unidad
        ]
      };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Al menos un par valor/unidad debe estar completo');
      }
    });

    it('limits valor/unidad pairs to maximum', () => {
      const invalidComponente = {
        ...validComponente,
        valorUnidad: Array(11).fill({ valor: 'test', unidad: 'unit' }) // 11 pairs
      };
      const result = componenteCreateSchema.safeParse(invalidComponente);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('No se pueden especificar más de 10 pares valor/unidad');
      }
    });

    it('validates stockMinimo constraints', () => {
      const invalidStockValues = [-1, 1.5, 1000000]; // Negative, decimal, too large

      invalidStockValues.forEach(stockMinimo => {
        const componente = { ...validComponente, stockMinimo };
        const result = componenteCreateSchema.safeParse(componente);
        expect(result.success).toBe(false);
      });
    });

    it('accepts valid ubicaciones', () => {
      const componenteWithUbicaciones = {
        ...validComponente,
        ubicaciones: [
          {
            cajoncitoId: '1',
            cantidad: 50
          }
        ]
      };
      const result = componenteCreateSchema.safeParse(componenteWithUbicaciones);
      expect(result.success).toBe(true);
    });

    it('validates ubicaciones structure', () => {
      const invalidUbicaciones = [
        { cajoncitoId: '', cantidad: 50 }, // Empty cajoncitoId
        { cajoncitoId: '1', cantidad: 0 }, // Zero cantidad
        { cajoncitoId: '1', cantidad: -5 }, // Negative cantidad
        { cajoncitoId: '1', cantidad: 1.5 }, // Decimal cantidad
        { cajoncitoId: '1', cantidad: 1000000 }, // Too large cantidad
      ];

      invalidUbicaciones.forEach(ubicacion => {
        const componente = { ...validComponente, ubicaciones: [ubicacion] };
        const result = componenteCreateSchema.safeParse(componente);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('componenteUpdateSchema', () => {
    it('allows partial updates', () => {
      const partialUpdate = {
        descripcion: 'Updated description'
      };
      const result = componenteUpdateSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('validates provided fields correctly', () => {
      const invalidUpdate = {
        categoria: 'INVALID',
        descripcion: '',
        stockMinimo: -1
      };
      const result = componenteUpdateSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('allows empty valorUnidad for updates', () => {
      const updateWithoutValorUnidad = {
        descripcion: 'Updated description'
      };
      const result = componenteUpdateSchema.safeParse(updateWithoutValorUnidad);
      expect(result.success).toBe(true);
    });

    it('validates valorUnidad when provided', () => {
      const updateWithInvalidValorUnidad = {
        descripcion: 'Updated description',
        valorUnidad: [{ valor: '', unidad: '' }]
      };
      const result = componenteUpdateSchema.safeParse(updateWithInvalidValorUnidad);
      expect(result.success).toBe(false);
    });
  });

  describe('validateComponenteByCategory', () => {
    const validPairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '0.25', unidad: 'W' }
    ];

    describe('RESISTENCIA validation', () => {
      it('accepts valid resistencia specifications', () => {
        const result = validateComponenteByCategory('RESISTENCIA', validPairs);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('requires ohm unit for resistencia', () => {
        const invalidPairs = [
          { valor: '0.25', unidad: 'W' },
          { valor: '5%', unidad: '%' }
        ];
        const result = validateComponenteByCategory('RESISTENCIA', invalidPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Las resistencias deben especificar el valor en ohmios (Ω, kΩ, MΩ)'
        );
      });

      it('validates maximum values for resistencia', () => {
        const tooManyPairs = Array(6).fill({ valor: 'test', unidad: 'Ω' });
        const result = validateComponenteByCategory('RESISTENCIA', tooManyPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('no debe tener más de 5 especificaciones');
      });

      it('validates allowed units for resistencia', () => {
        const invalidUnitPairs = [
          { valor: '1K', unidad: 'Ω' },
          { valor: '16V', unidad: 'V' } // V not in allowed units for resistencia
        ];
        const result = validateComponenteByCategory('RESISTENCIA', invalidUnitPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('Unidades no permitidas para RESISTENCIA');
      });
    });

    describe('CAPACITOR validation', () => {
      it('accepts valid capacitor specifications', () => {
        const capacitorPairs = [
          { valor: '100', unidad: 'nF' },
          { valor: '16V', unidad: 'V' }
        ];
        const result = validateComponenteByCategory('CAPACITOR', capacitorPairs);
        expect(result.isValid).toBe(true);
      });

      it('requires capacitance unit for capacitor', () => {
        const invalidPairs = [
          { valor: '16V', unidad: 'V' },
          { valor: '85°C', unidad: '°C' }
        ];
        const result = validateComponenteByCategory('CAPACITOR', invalidPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Los capacitores deben especificar la capacitancia (pF, nF, µF, mF, F)'
        );
      });

      it('validates maximum values for capacitor', () => {
        const tooManyPairs = Array(5).fill({ valor: 'test', unidad: 'nF' });
        const result = validateComponenteByCategory('CAPACITOR', tooManyPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('no debe tener más de 4 especificaciones');
      });
    });

    describe('INTEGRADO validation', () => {
      it('accepts valid IC specifications', () => {
        const icPairs = [
          { valor: '5', unidad: 'V' },
          { valor: '16', unidad: 'pines' },
          { valor: '1MHz', unidad: 'MHz' }
        ];
        const result = validateComponenteByCategory('INTEGRADO', icPairs);
        expect(result.isValid).toBe(true);
      });

      it('requires voltage for IC', () => {
        const invalidPairs = [
          { valor: '16', unidad: 'pines' },
          { valor: '1MHz', unidad: 'MHz' }
        ];
        const result = validateComponenteByCategory('INTEGRADO', invalidPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Los circuitos integrados deben especificar el voltaje de operación'
        );
      });
    });

    describe('VENTILADOR validation', () => {
      it('accepts valid fan specifications', () => {
        const fanPairs = [
          { valor: '12', unidad: 'V' },
          { valor: '2000', unidad: 'RPM' },
          { valor: '30', unidad: 'CFM' }
        ];
        const result = validateComponenteByCategory('VENTILADOR', fanPairs);
        expect(result.isValid).toBe(true);
      });

      it('requires voltage for fan', () => {
        const invalidPairs = [
          { valor: '2000', unidad: 'RPM' },
          { valor: '30', unidad: 'CFM' }
        ];
        const result = validateComponenteByCategory('VENTILADOR', invalidPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'Los ventiladores deben especificar el voltaje de operación'
        );
      });
    });

    describe('OTROS validation', () => {
      it('accepts any valid units for OTROS', () => {
        const otrosPairs = [
          { valor: '12', unidad: 'V' },
          { valor: '2', unidad: 'A' },
          { valor: '24', unidad: 'W' }
        ];
        const result = validateComponenteByCategory('OTROS', otrosPairs);
        expect(result.isValid).toBe(true);
      });

      it('validates maximum values for OTROS', () => {
        const tooManyPairs = Array(11).fill({ valor: 'test', unidad: 'unit' });
        const result = validateComponenteByCategory('OTROS', tooManyPairs);
        expect(result.isValid).toBe(false);
        expect(result.errors[0]).toContain('no debe tener más de 10 especificaciones');
      });
    });

    it('handles unknown categoria gracefully', () => {
      const result = validateComponenteByCategory('UNKNOWN', validPairs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates allowed units case-insensitively', () => {
      const mixedCasePairs = [
        { valor: '1K', unidad: 'ω' }, // Lowercase omega
        { valor: '0.25', unidad: 'w' } // Lowercase watt
      ];
      const result = validateComponenteByCategory('RESISTENCIA', mixedCasePairs);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateComponente', () => {
    const validComponente = {
      categoria: 'RESISTENCIA',
      descripcion: 'Resistencia de 1K ohm',
      valorUnidad: [{ valor: '1K', unidad: 'Ω' }],
      stockMinimo: 10,
    };

    it('validates complete componente for creation', () => {
      const result = validateComponente(validComponente, false);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates componente for update', () => {
      const updateData = {
        descripcion: 'Updated description',
        stockMinimo: 15
      };
      const result = validateComponente(updateData, true);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns schema validation errors', () => {
      const invalidComponente = {
        ...validComponente,
        descripcion: '',
        stockMinimo: -1
      };
      const result = validateComponente(invalidComponente, false);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('includes category validation errors', () => {
      const invalidCategoryComponente = {
        categoria: 'RESISTENCIA',
        descripcion: 'Test component',
        valorUnidad: [{ valor: '16V', unidad: 'V' }], // Missing ohm unit
        stockMinimo: 10,
      };
      const result = validateComponente(invalidCategoryComponente, false);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Las resistencias deben especificar el valor en ohmios (Ω, kΩ, MΩ)'
      );
    });

    it('handles missing categoria gracefully', () => {
      const componenteWithoutCategoria = {
        descripcion: 'Test component',
        valorUnidad: [{ valor: '1K', unidad: 'Ω' }],
        stockMinimo: 10,
      };
      const result = validateComponente(componenteWithoutCategoria, true); // Update context
      expect(result.isValid).toBe(true);
    });

    it('handles missing valorUnidad gracefully', () => {
      const componenteWithoutValorUnidad = {
        categoria: 'RESISTENCIA',
        descripcion: 'Test component',
        stockMinimo: 10,
      };
      const result = validateComponente(componenteWithoutValorUnidad, true); // Update context
      expect(result.isValid).toBe(true);
    });
  });

  describe('categoryValidationRules', () => {
    it('has rules for all categories', () => {
      const categories = ['RESISTENCIA', 'CAPACITOR', 'INTEGRADO', 'VENTILADOR', 'OTROS'];
      categories.forEach(categoria => {
        expect(categoryValidationRules[categoria as keyof typeof categoryValidationRules]).toBeDefined();
      });
    });

    it('has required properties for each category', () => {
      const categories = ['RESISTENCIA', 'CAPACITOR', 'INTEGRADO', 'VENTILADOR', 'OTROS'];
      categories.forEach(categoria => {
        const rules = categoryValidationRules[categoria as keyof typeof categoryValidationRules];
        expect(rules).toHaveProperty('allowedUnits');
        expect(rules).toHaveProperty('commonValues');
        expect(rules).toHaveProperty('maxValues');
        expect(rules).toHaveProperty('rules');
        expect(Array.isArray(rules.allowedUnits)).toBe(true);
        expect(Array.isArray(rules.commonValues)).toBe(true);
        expect(Array.isArray(rules.rules)).toBe(true);
        expect(typeof rules.maxValues).toBe('number');
      });
    });

    it('has logical maxValues per category', () => {
      expect(categoryValidationRules.RESISTENCIA.maxValues).toBeLessThan(categoryValidationRules.INTEGRADO.maxValues);
      expect(categoryValidationRules.OTROS.maxValues).toBeGreaterThanOrEqual(categoryValidationRules.CAPACITOR.maxValues);
    });

    it('OTROS category has no specific rules', () => {
      expect(categoryValidationRules.OTROS.rules).toHaveLength(0);
    });

    it('each category has relevant allowed units', () => {
      expect(categoryValidationRules.RESISTENCIA.allowedUnits).toContain('Ω');
      expect(categoryValidationRules.RESISTENCIA.allowedUnits).toContain('W');

      expect(categoryValidationRules.CAPACITOR.allowedUnits).toContain('µF');
      expect(categoryValidationRules.CAPACITOR.allowedUnits).toContain('V');

      expect(categoryValidationRules.INTEGRADO.allowedUnits).toContain('V');
      expect(categoryValidationRules.INTEGRADO.allowedUnits).toContain('pines');

      expect(categoryValidationRules.VENTILADOR.allowedUnits).toContain('RPM');
      expect(categoryValidationRules.VENTILADOR.allowedUnits).toContain('V');
    });
  });
});