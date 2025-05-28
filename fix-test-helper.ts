// This is a temporary test file to fix the issue
const moduleId = '507f1f77bcf86cd799439011';
const updateDto = {
  nombre: 'Módulo Actualizado',
  descripcion: 'Descripción actualizada',
  usuarioActualizacion: 'admin',
};

// Fix the test by using this pattern
beforeEach(() => {
  // Setup mocks
  // Reset mock behaviors for each test
  jest.clearAllMocks();

  // Mock findById correctly
  mockModuloModel.findById.mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockModuloData),
  });

  // Mock findByIdAndUpdate correctly
  mockModuloModel.findByIdAndUpdate.mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      toObject: jest.fn().mockReturnValue({
        ...mockModuloData,
        ...updateDto,
        entidades: [],
        __v: 0,
      }),
    }),
  });

  // Mock findOne correctly
  mockModuloModel.findOne.mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
});

// Then in your test:
const result = await service.update(moduleId, updateDto);
